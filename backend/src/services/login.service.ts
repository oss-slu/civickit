// backend/src/services/login.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginRepository } from '../repositories/login.repository';
import { LoginDTO, LoginResponse} from "../types/login.types";
import "dotenv/config";

export class LoginService {
  constructor(private loginRepository: LoginRepository) {}

  async login(credentials: LoginDTO): Promise<LoginResponse> {
    const user = await this.loginRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('email not found'); 
    }
    
    //compare user entered pw with pw hash from repo
    const match = await bcrypt.compare(credentials.password, String(user.passwordHash))
    if(!match){
       throw new Error('password and email do not match'); 
    }
    
    //generate token with user id
    const key = String(process.env.JWT_SECRET)
    const token = jwt.sign({userId: user.id}, key, {expiresIn: '7d'})

    const loginResponse: LoginResponse = {
      token: token,
      user: {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email)
      }
    };
    
    return loginResponse;
  }
}

