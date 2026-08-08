import { Request, Response, NextFunction } from "express";
import { rolePermissions } from "../config/permissions";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError, UnauthorizedError } from "../utils/errors";
import { OrgMembershipRepository } from "../repositories/orgMembership.repository";
import { IssueRepository } from "../repositories/issue.repository";
import { OrgRepository } from "../repositories/org.repository";

const authRepo = new AuthRepository();
const orgMembershipRepo = new OrgMembershipRepository();
const issueRepo = new IssueRepository();
const orgRepo = new OrgRepository();

function requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new UnauthorizedError("Not authenticated");
            }

            console.log(req)

            // Load the role fresh from the DB every request → revocation is instant.
            const user = await authRepo.findById(userId);
            if (!user) {
                throw new UnauthorizedError("User not found");
            }

            const allowed = rolePermissions[user.role];
            if (!allowed || !allowed.includes(permission)) {
                if (permission == "update:claim_issue") {
                    const orgMembership = await orgMembershipRepo.findByUser(userId)
                    if (!orgMembership) {
                        throw new UnauthorizedError("User not in an organization");
                    }
                    if (orgMembership.role != "ORG_MEMBER" &&
                        orgMembership.role != "ORG_ADMIN"
                    ) {
                        throw new AppError("Forbidden", 403);
                    }

                    //TODO: check that issue is within org's service area
                } else if (permission == "create:timeline_entry") {
                    if (!req.params.issueId) {
                        throw new UnauthorizedError("No issueId provided");
                    }

                    const orgMembership = await orgMembershipRepo.findByUser(userId)
                    if (!orgMembership) {
                        throw new UnauthorizedError("User not in any organization");
                    }
                    if (orgMembership.role != "ORG_MEMBER" &&
                        orgMembership.role != "ORG_ADMIN"
                    ) {
                        throw new AppError("Forbidden", 403);
                    }

                    const issue = await issueRepo.findById(String(req.params.issueId))
                    const claimedById = issue?.claimedById
                    if (!claimedById) {
                        throw new UnauthorizedError("Issue not claimed");
                    }

                    const orgClaimedBy = await orgMembershipRepo.findByUser(claimedById)
                    if (!orgClaimedBy) {
                        throw new UnauthorizedError("Isse not claimed by any organization");
                    }

                    if (orgClaimedBy.organizationId != orgMembership.organizationId) {
                        throw new UnauthorizedError("User not in selected issue's organization");
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