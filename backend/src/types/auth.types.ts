// backend/src/types/auth.types.ts

import { User } from "@prisma/client";

// Data coming from the client
export interface CreateAuthDTO {
  email: string;
  password: string;
  name: string;
}

// Safe user to return (remove passwordHash)
export type SafeUser = Omit<User, "passwordHash">;