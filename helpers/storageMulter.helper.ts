// middlewares/uploadStorage.ts
import multer from "multer";
import type { Request } from "express";

export const createUploadStorage = (): multer.StorageEngine => {
  const storage = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ): void => {
      cb(null, "./public/uploads/");
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ): void => {
      const uniqueSuffix = Date.now();
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  return storage;
};

export default createUploadStorage;
