import { Request, Response } from "express";
import Product from "../../models/product.model";

// [GET] /products
export const index = async (req: Request, res: Response) => {
  const products = Product.find({
    deleted: false,
  });

  console.log(products);

  res.render("client/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
  });
};
