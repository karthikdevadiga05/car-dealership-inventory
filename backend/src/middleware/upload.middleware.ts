import multer from 'multer';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Reads one multipart file named "image" into memory (2 MB max). */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
}).single('image');