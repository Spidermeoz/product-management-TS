import { Request, Response, Router } from "express";

import * as controller from "../../controllers/client/product.controller";

const router: Router = Router();

router.get("/", controller.index);

router.get("/:slug", controller.detail);

export const productRoutes: Router = router;
