import { Router } from "express";
import multer from "multer";

import * as controller from "../../controllers/admin/account.controller";
import * as validate from "../../validates/admin/account.validate";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middlewares";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // hoặc diskStorage

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  validate.validateCreateAccount,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch<{ id: string }>(
  "/edit/:id",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  validate.validateEditAccount,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

router.delete("/delete/:id", controller.deleteItem);

export const accountRoutes: Router = router;