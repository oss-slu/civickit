// backend/src/middleware/upload.middleware.ts

import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, PNG, WEBP allowed.')); // file callback
    } else {
        cb(null, true);
    }
};

export const uploadMiddleware = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });