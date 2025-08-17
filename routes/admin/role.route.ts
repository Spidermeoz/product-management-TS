import { Router } from "express";

import * as controller from "../../controllers/admin/role.controller";

import * as validate from "../../validates/admin/product.validate";

const router: Router = Router();

router.get("/", controller.index);

router.get("/create", controller.create);

router.post("/create", validate.validateEditRole, controller.createPost);

router.get("/detail/:id", controller.detail);

router.get("/edit/:id", controller.edit);

router.patch<{ id: string }>(
  "/edit/:id",
  validate.validateEditRole,
  controller.editPatch
);

router.delete("/delete/:id", controller.deleteItem);

router.get("/permissions", controller.permissions);

router.patch("/permissions", controller.permissionsPatch);

export const roleRoutes: Router = router;
