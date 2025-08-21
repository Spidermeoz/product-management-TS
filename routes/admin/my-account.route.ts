import { Router } from "express";
import multer from "multer";

import * as controller from "../../controllers/admin/my-account.controller";
import * as validate from "../../validates/admin/account.validate";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middlewares";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // hoặc diskStorage

router.get("/", controller.index);

router.get("/edit", controller.edit);

router.patch<{ id: string }>(
  "/edit",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  validate.validateEditAccount,
  controller.editPatch
);

export const myAccountRoutes: Router = router;