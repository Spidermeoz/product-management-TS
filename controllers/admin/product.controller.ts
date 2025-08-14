import { Request, Response } from "express";
import Product from "../../models/product.model";

// [GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
  const productsData = await Product.find({
    deleted: false,
  });

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData,
  });
};
