import { Router } from "express";
import multer from "multer";

import * as controller from "../../controllers/admin/product-category.controller";
import * as validate from "../../validates/admin/product.validate";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middlewares";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // hoặc diskStorage

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.validateCreatePost,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch<{ id: string }>(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.validateCreatePost,
  controller.editPatch
);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/detail/:id", controller.detail);

export const productCategoryRoutes : Router = router;