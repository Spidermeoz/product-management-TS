import { Router } from "express";

import * as controller from "../../controllers/admin/product.controller";

const router: Router = Router();

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post("/create", controller.createPost);

export const productRoutes: Router = router;