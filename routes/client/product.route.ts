import { Request, Response, Router } from "express";
import Product from "../../models/product.model";
const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  const products = Product.find({
    deleted: false,
  });

  console.log(products)

  res.render("client/pages/products/index");
});

export const productRoutes: Router = router;
