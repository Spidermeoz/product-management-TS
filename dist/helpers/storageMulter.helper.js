"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUploadStorage = void 0;
const multer_1 = __importDefault(require("multer"));
const createUploadStorage = () => {
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./public/uploads/");
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now();
            cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
    });
    return storage;
};
exports.createUploadStorage = createUploadStorage;
exports.default = exports.createUploadStorage;
