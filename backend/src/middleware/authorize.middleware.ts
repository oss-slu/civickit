import { Request, Response, NextFunction } from "express";
import { rolePermissions } from "../config/permissions";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError, UnauthorizedError } from "../utils/errors";

const authRepo = new AuthRepository();

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
                throw new AppError("Forbidden", 403);
            }

            next();
        } catch (err) {
            // Thrown AppErrors carry their status; a DB failure becomes a 500.
            next(err);
        }
    };
}

export { requirePermission };