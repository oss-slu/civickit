// backend/src/services/login.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginRepository } from '../repositories/login.repository';
import { LoginDTO, LoginResponse } from "@civickit/shared";
import "dotenv/config";
import { AppError } from "../utils/errors";
import { JWT_SECRET } from "../config/env";
import { PhotoRepository } from "../repositories/photo.repository";

export class LoginService {
  constructor(private loginRepository: LoginRepository, private photoRepository: PhotoRepository) { }

  async login(credentials: LoginDTO): Promise<LoginResponse | AppError> {
    const user = await this.loginRepository.findByEmail(credentials.email);

    if (user == null) {
      //TODO: fix to throw AppError
      throw new AppError('Email not found', 401);
    }

    //compare user entered pw with pw hash from repo
    const match = await bcrypt.compare(credentials.password, String(user.passwordHash))
    if (!match) {
      throw new AppError('Password and email do not match', 401);
    }

    //generate token with user id
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    // The row types its timestamps as Date; the shared Photo type describes the
    // wire shape, where they are ISO strings. Express would serialize them
    // either way -- this is the one boundary that declares a response type, so
    // it is the one place the conversion has to be explicit.
    const photoRow = user.profilePhotoId
      ? await this.photoRepository.findById(user.profilePhotoId)
      : null;
    const profilePhoto = photoRow && {
      ...photoRow,
      createdAt: photoRow.createdAt.toISOString(),
      photoTakenAt: photoRow.photoTakenAt?.toISOString() ?? null,
    };

    const loginResponse: LoginResponse = {
      token: token,
      user: {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        createdAt: String(user.createdAt),
        role: user.role,
        profilePhoto,
      }
    };

    return loginResponse;
  }
}

