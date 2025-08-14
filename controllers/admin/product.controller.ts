// controllers/admin/products.controller.ts
import { Request, Response } from "express";import Product from "../../models/product.model";
import { makeFilterStatus, Status } from "../../helpers/filterStatus.helper";
import { makeSearch } from "../../helpers/search.helper";
import { makePagination } from "../../helpers/pagination.helper";

interface ProductsQuery {
  page?: string;
  status?: Status | "";
  keyword?: string;
}

interface ProductFind {
  deleted: boolean;
  status?: Status;
  $or?: unknown[];
  [key: string]: unknown;
}

type ChangeMultiType = "active" | "inactive" | "delete-all" | "change-position";

interface ChangeMultiBody {
  type?: ChangeMultiType;
  ids?: string | string[]; // "id1,id2" hoặc ["id1","id2"]
}

const isChangeType = (t: unknown): t is ChangeMultiType =>
  t === "active" || t === "inactive" || t === "delete-all" || t === "change-position";

const toIdList = (ids: string | string[] | undefined): string[] => {
  if (!ids) return [];
  const raw = Array.isArray(ids) ? ids : ids.split(",");
  return raw.map((s) => String(s).trim()).filter(Boolean);
};

// [GET] /admin/products
export const index = async (
  req: Request<unknown, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  // Filter trạng thái
  const { filterStatus, currentStatus } = makeFilterStatus(req.query.status);

  // Search theo từ khóa (mặc định field 'title')
  const { keyword, criteria } = makeSearch(
    req.query as unknown as Record<string, unknown>,
    {
      fields: ["title"],
      // paramKey: "keyword" // (mặc định là 'keyword', có thể đổi)
    }
  );

  // Điều kiện Mongo
  const find: ProductFind = { deleted: false };
  if (currentStatus) find.status = currentStatus;
  if (criteria) Object.assign(find, criteria);

  // Đếm tổng số bản ghi theo điều kiện
  const totalItems = await Product.countDocuments(find);

  // Pagination
  const pagination = makePagination({
    page: req.query.page, // page trực tiếp từ query
    totalItems,
    limit: 6, // hoặc lấy từ config .env
  });

  // Lấy dữ liệu trang hiện tại
  const productsData = await Product.find(find)
    .sort({ position: "desc" })
    .limit(pagination.limitItems)
    .skip(pagination.skip)
    .lean();

  // Render
  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData,
    filterStatus,
    keyword, // prefill ô search
    status: currentStatus, // nếu view cần giữ hidden input status
    pagination, // truyền nguyên state phân trang
  });
};

// [PATCH] /admin/products/change-status/:status/:id
export const changeStatus = async (
  req: Request<{ status: string; id: string }, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });
  req.flash("success", "Thay đổi trạng thái sản phẩm thành công!");

  res.redirect(req.headers.referer);
};

// [PATCH] /admin/products/change-multi
export const changeMulti = async (
  req: Request<unknown, unknown, ChangeMultiBody>,
  res: Response
): Promise<void> => {
  const referer = req.get("referer") || "/admin/products";

  try {
    const { type } = req.body;
    const idList = toIdList(req.body.ids);

    if (!isChangeType(type) || idList.length === 0) {
      return res.redirect(referer);
    }

    switch (type) {
      case "active":
        await Product.updateMany(
          { _id: { $in: idList } },
          { $set: { status: "active" } }
        );
        req.flash("success", `${idList.length} sản phẩm được cập nhật trạng thái thành công!`);
        break;

      case "inactive":
        await Product.updateMany(
          { _id: { $in: idList } },
          { $set: { status: "inactive" } }
        );
        req.flash("success", `${idList.length} sản phẩm được cập nhật trạng thái thành công!`);
        break;

      case "delete-all":
        await Product.updateMany(
          { _id: { $in: idList } },
          { $set: { deleted: true, deletedAt: new Date() } }
        );
        req.flash("success", `${idList.length} sản phẩm được xóa thành công!`);
        break;

      case "change-position":
        for (const item of idList) {
          const [id, position] = item.split("-");
          await Product.updateOne({ _id: id }, { position: parseInt(position) });
          req.flash("success", `${idList.length} sản phẩm được đổi vị trí thành công!`);
        }
        break;
    }

    return res.redirect(referer);
  } catch (err) {
    console.error("[changeMulti] error:", err);
    return res.redirect(referer);
  }
};

// [DELETE] /admin/products/delete/:id
export const deleteItem = async (
  req: Request<{ id: string }, unknown, unknown, ProductsQuery>,
  res: Response
): Promise<void> => {
  const id = req.params.id;

  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );

  res.redirect(req.headers.referer);
};
