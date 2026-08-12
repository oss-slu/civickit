import { Request, Response, NextFunction } from "express";
import { rolePermissions } from "../config/permissions";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError, UnauthorizedError } from "../utils/errors";
import { MembershipRepository } from "../repositories/membership.repository";
import { IssueRepository } from "../repositories/issue.repository";
import { OrgRepository } from "../repositories/org.repository";

const authRepo = new AuthRepository();
const orgMembershipRepo = new MembershipRepository();
const issueRepo = new IssueRepository();
const orgRepo = new OrgRepository();

/** Both org roles respond to issues; ORG_ADMIN additionally manages members. */
function isResponder(membership: { role: string } | null | undefined): boolean {
    return membership?.role === "ORG_MEMBER" || membership?.role === "ORG_ADMIN";
}

function requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new UnauthorizedError("Not authenticated");
            }
            // Load the role fresh from the DB every request → revocation is instant.
            const user = await authRepo.findById(userId);
            if (!user) {
                throw new UnauthorizedError("User not found");
            }

            const allowed = rolePermissions[user.role];
            if (!allowed || !allowed.includes(permission)) {
                if (permission == "update:claim_issue") {
                    const orgMembership = await orgMembershipRepo.findByUser(userId)
                    if (!isResponder(orgMembership)) {
                        throw new AppError("User not in an organization", 403);
                    }

                    //TODO: check that issue is within org's service area
                } else if (permission == "create:timeline_entry" ||
                    permission == "update:release_issue" ||
                    permission == 'update:issue_status') {

                    // Cheap gate first: a user who responds for nobody cannot
                    // act on any claimed issue, so there is no point reading it.
                    const orgMembership = await orgMembershipRepo.findByUser(userId)
                    if (!isResponder(orgMembership)) {
                        throw new AppError("User not in any organization", 403);
                    }

                    if (!req.params || !req.params.issueId) {
                        throw new AppError("No issueId provided", 400);
                    }

                    const issue = await issueRepo.findById(String(req.params.issueId))
                    const claimedById = issue?.claimedById
                    if (!claimedById) {
                        throw new AppError("Issue not claimed", 400);
                    }

                    const orgClaimedBy = await orgMembershipRepo.findByUser(claimedById)
                    if (!orgClaimedBy) {
                        throw new AppError("Issue not claimed by any organization", 400);
                    }

                    // Scoped to the claiming org on purpose. Comparing against
                    // the caller's own findByUser row would ask "does the
                    // caller respond for some org", which an unordered LIMIT 1
                    // answers arbitrarily once anyone belongs to two.
                    const callerInClaimingOrg = await orgMembershipRepo.findByUserAndOrg(
                        userId,
                        orgClaimedBy.organizationId,
                    );
                    if (!isResponder(callerInClaimingOrg)) {
                        throw new AppError("User not in selected issue's organization", 403);
                    }
                } else {
                    throw new AppError("Forbidden", 403);
                }
            }

            next();
        } catch (err) {
            // Thrown AppErrors carry their status; a DB failure becomes a 500.
            next(err);
        }
    };
}

export { requirePermission };