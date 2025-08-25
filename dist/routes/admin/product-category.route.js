"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategoryRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const controller = __importStar(require("../../controllers/admin/product-category.controller"));
const validate = __importStar(require("../../validates/admin/product.validate"));
const uploadCloud = __importStar(require("../../middlewares/admin/uploadCloud.middlewares"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", upload.single("thumbnail"), uploadCloud.uploadSingle, validate.validateCreateProductCategory, controller.createPost);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", upload.single("thumbnail"), uploadCloud.uploadSingle, validate.validateCreateProductCategory, controller.editPatch);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteItem);
router.get("/detail/:id", controller.detail);
exports.productCategoryRoutes = router;
