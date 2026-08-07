// backend/src/types/auth.types.ts

import { User } from "../db/schema";

// Safe user to return (remove passwordHash)
export type SafeUser = Omit<User, "passwordHash">;