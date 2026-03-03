// backend/src/middleware/upload.middleware.ts

import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {

    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed.'));
    } else {
        cb(null, true);
    }
};

export const uploadMiddleware = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });