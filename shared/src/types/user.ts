// shared/src/types/user.ts
import { Image } from "./image";

import { UserRole } from "../enums/user";

export interface User {
    id: string,
    name: string,
    profileImage?: Image | null,
    profileImageId?: string
    createdAt: string,
    email: string,
    role: UserRole;
}
