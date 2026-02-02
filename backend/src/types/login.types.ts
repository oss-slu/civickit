// backend/src/types/login.types.ts

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
}