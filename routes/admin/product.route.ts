import { Router } from "express";
import multer from "multer";
import createUploadStorage from "../../helpers/storageMulter.helper";

import * as controller from "../../controllers/admin/product.controller";
import * as validate from "../../validates/admin/product.validate";

const router: Router = Router();

const upload = multer({ storage: createUploadStorage() });

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.validateCreatePost,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch<{ id: string }>(
  "/edit/:id",
  upload.single("thumbnail"),
  validate.validateCreatePost,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

export const productRoutes: Router = router;
