import { Request, Response, Router } from "express";

import * as controller from "../../controllers/client/product.controller";

const router: Router = Router();

router.get("/", controller.index);

export const productRoutes: Router = router;
