import { Role } from "@prisma/client";

//action : (on available) resource 
const reporter_perms = ['create:issue', 'create:upvote',
    'read:upvote', 'delete:upvote', 'create:upload_signature'];

// Admins can do everything a reporter can, plus admin-only actions.
export const rolePermissions: Record<Role, string[]> = {
    REPORTER: reporter_perms,
    ADMIN: [...reporter_perms, 'update:issue_status'],
};