// shared/src/types/user.ts
import { Photo } from "./photo";

import { UserRole } from "../enums/user";

export interface User {
    id: string,
    name: string,
    profilePhoto?: Photo | null,
    createdAt: string,
    email: string,
    role: UserRole;
}
