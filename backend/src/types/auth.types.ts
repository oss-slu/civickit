// backend/src/types/auth.types.ts

import { User } from "@prisma/client";

// Safe user to return (remove passwordHash)
export type SafeUser = Omit<User, "passwordHash">;