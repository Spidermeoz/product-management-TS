import { Request, Response } from "express";
import Product from "../../models/product.model";

interface DetailParams {
  slug: string;
}

// [GET] /products
export const index = async (req: Request, res: Response) => {
  const products = await Product.find({
    status: "active",
    deleted: false,
  }).sort({ position: "desc" }); // Sắp xếp theo vị trí giảm dần

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

// [GET] /products/:slug
export const detail = async (
  req: Request<DetailParams>,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findOne({
      deleted: false,
      slug: req.params.slug,
      status: "active",
    }).lean();

    if (!product) {
      req.flash?.("error", "Sản phẩm không tồn tại!");
      res.redirect("/products");
      return;
    }

    res.render("client/pages/products/detail", {
      pageTitle: product.title || "Chi tiết sản phẩm",
      product,
    });
  } catch (error) {
    console.error("[client.products.detail] error:", error);
    req.flash?.("error", "Sản phẩm không tồn tại!");
    res.redirect("/products");
  }
};

