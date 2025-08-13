import { Request, Response } from "express";
import Product from "../../models/product.model";
import { it } from "node:test";

// [GET] /products
export const index = async (req: Request, res: Response) => {
  const products = await Product.find({
    status: "active",
    deleted: false,
  });

  const newProducts = products.map((item) => {
    item["newPrice"] = item.price - (item.price * item.discountPercentage) / 100;
    item["newPrice"] = item["newPrice"].toFixed(2); // Làm tròn đến 2 chữ số thập phân

    return item;
  });

  res.render("client/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: newProducts
  });
};
