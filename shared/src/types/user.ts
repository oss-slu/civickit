// shared/src/types/user.ts

import { UserRole } from "../enums/user";

export interface User {
    id: string,
    name: string,
    profileImage: string,
    createdAt: string,
    email: string,
    role: UserRole;
}
