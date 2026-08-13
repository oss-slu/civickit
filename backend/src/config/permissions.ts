import { Role } from "../db/schema";

//action : (on available) resource 
const reporter_perms = ['create:issue', 'create:upvote',
    'read:upvote', 'delete:upvote', 'create:upload_signature'];

// Admins can do everything a reporter can, plus admin-only actions.
//
// create:timeline_entry sits here rather than being left to the org-membership
// branch in requirePermission: posting an update is how a status change is
// explained, and an admin who can change status but cannot say why can only
// leave the timeline misleading.
export const rolePermissions: Record<Role, string[]> = {
    REPORTER: reporter_perms,
    ADMIN: [...reporter_perms, 'update:issue_status', 'create:timeline_entry'],
};