// backend/src/services/login.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginRepository } from '../repositories/login.repository';
import { User } from "../types/login.types";
import "dotenv/config";

export class LoginService {
  constructor(private loginRepository: LoginRepository) {}

  async getUser(email: string, password: string) {
    const user = await this.loginRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found'); //TODO: add error code?
    }
    
    //compare user entered pw with pw hash from repo
    const match = await bcrypt.compare(password, user.passwordHash)
    if(!match){
       throw new Error('Password and Email do not match'); //TODO: add error code?
    }
    
    //generate token with user id
    const key = String(process.env.JWT_SECRET)
    const token = jwt.sign({userId: user.id}, key, {expiresIn: '7d'})
    console.log(user, token)
    
    const userToSend = {id: user.id, email: user.email, name: user.name}
    return {token, user: userToSend}; 
  }
}

