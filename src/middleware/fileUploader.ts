import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import logger from '../utils/logger';

interface FileUploadOptions {
  folderName: string;
  allowedMimeTypes: string[];
  maxSizeMB: number;
}

export const ALLOWED_IMAGE_TYPES = {
  companyLogo: ['image/jpeg', 'image/png', 'image/svg+xml'],
  userAvatar: ['image/jpeg', 'image/png', 'image/webp'],
};

export function createFileUploader({ folderName, allowedMimeTypes, maxSizeMB }: FileUploadOptions) {
  const uploadDir = path.join(__dirname, '../../uploads', folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const extName = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${extName}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
      }
    },
  });
}

/**
 * Packaging Multer middleware to capture errors and pass them to the unified error handling middleware
 */
export function wrapMulterMiddleware(
  multerMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, err => {
      if (err) {
        logger.error('File upload error:', err);
        return next(err);
      }
      next();
    });
  };
}
