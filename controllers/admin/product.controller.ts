// controllers/admin/products.controller.ts
import { Request, Response } from "express";
import Product from "../../models/product.model";

// ----- Types -----
type Status = "active" | "inactive";

interface ProductsQuery {
  status?: Status | ""; // "" ~ Tất cả
}

interface FilterStatusItem {
  name: string;
  status: Status | "";
  class: "" | "active";
}

interface ProductFind {
  deleted: boolean;
  status?: Status;
}

// Type guard for status
const isStatus = (val: unknown): val is Status =>
  val === "active" || val === "inactive";

// [GET] /admin/products
export const index = async (
  req: Request<unknown, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  // Filter status menu
  const filterStatus: FilterStatusItem[] = [
    { name: "Tất cả", status: "", class: "" },
    { name: "Hoạt động", status: "active", class: "" },
    { name: "Dừng hoạt động", status: "inactive", class: "" },
  ];

  // Mark active item (default: "Tất cả")
  let activeIndex = 0;
  if (isStatus(req.query.status)) {
    const idx = filterStatus.findIndex((i) => i.status === req.query.status);
    if (idx !== -1) activeIndex = idx;
  }
  filterStatus[activeIndex].class = "active";

  // Build find conditions
  const find: ProductFind = { deleted: false };
  if (isStatus(req.query.status)) {
    find.status = req.query.status;
  }

  // Query products (use .lean() for performance if you render only)
  const productsData = await Product.find(find).lean();

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData,
    filterStatus: filterStatus
  });
};
