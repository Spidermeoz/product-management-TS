// controllers/admin/products.controller.ts
import { Request, Response } from "express";
import Product from "../../models/product.model";
import {
  makeFilterStatus,
  isStatus,
  Status,
} from "../../helpers/filterStatus.helper";

// Query types cho route
interface ProductsQuery {
  status?: Status | "";
  keyword?: string;
}

interface ProductFind {
  deleted: boolean;
  status?: Status;
  title?: string | { $regex: string; $options?: string };
}

// [GET] /admin/products
export const index = async (
  req: Request<unknown, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  // Lấy filterStatus + currentStatus từ helper
  const { filterStatus, currentStatus } = makeFilterStatus(req.query.status);

  // Điều kiện tìm kiếm
  const find: ProductFind = { deleted: false };
  if (currentStatus) find.status = currentStatus;

  // Từ khóa tìm kiếm (không phân biệt hoa/thường)
  let keyword = "";
  if (typeof req.query.keyword === "string" && req.query.keyword.trim()) {
    keyword = req.query.keyword.trim();
    find.title = { $regex: keyword, $options: "i" };
  }

  // Lấy dữ liệu
  const productsData = await Product.find(find).lean();

  // Render
  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData,
    filterStatus,
    keyword,
  });
};
