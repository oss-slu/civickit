// backend/src/controllers/image.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ImageService } from '../services/image.service';
import { ImageRepository } from '../repositories/image.repository';

const imageService = new ImageService(new ImageRepository)

export class ImageController {
  async createImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!

      const image = await imageService.createImage(
        {
          ...req.body,
        }, userId);
      res.status(201).json(image);

    } catch (error) {
      next(error);
    }

  }

  async getImageById(req: Request, res: Response, next: NextFunction) {
    try {
      const image = await imageService.getImageById(String(req.params.id));
      res.json(image);
    } catch (error) {
      next(error);
    }
  }

}