// controllers/admin/products.controller.ts
import { Request, Response } from "express";
import Product from "../../models/product.model";
import {
  makeFilterStatus,
  isStatus,
  Status,
} from "../../helpers/filterStatus.helper";
import { makeSearch } from "../../helpers/search.helper";

interface ProductsQuery {
  page: any;
  status?: Status | "";
  keyword?: string;
}

interface ProductFind {
  deleted: boolean;
  status?: Status;
  // hỗ trợ $or hoặc field đơn lẻ từ helper
  $or?: unknown[];
  [key: string]: unknown;
}

// [GET] /admin/products
export const index = async (
  req: Request<unknown, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  // Filter theo trạng thái
  const { filterStatus, currentStatus } = makeFilterStatus(req.query.status);

  // Tìm kiếm theo từ khóa (mặc định field 'title', có thể đổi ['title','sku'])
  const { keyword, criteria } = makeSearch(req.query as unknown as Record<string, unknown>, { fields: ["title"] });

  // Điều kiện Mongo
  const find: ProductFind = { deleted: false };
  if (currentStatus) find.status = currentStatus;
  if (criteria) Object.assign(find, criteria);

  // Pagination
  let objectPagination = {
    currentPage: 1,
    limitItems: 6,
    skip: 0,
    totalPages: 0
  }

  if (req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page);
  }

  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

  const countProducts = await Product.countDocuments(find);
  const totalPages = Math.ceil(countProducts / objectPagination.limitItems);
  objectPagination.totalPages = totalPages;
  //End of Pagination


  // Lấy dữ liệu
  const productsData = await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip);
  // Render
  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData,
    filterStatus: filterStatus,
    keyword: keyword, // để prefill ô search
    status: currentStatus, // nếu view cần giữ hidden input status,
    pagination: objectPagination
  });
};
