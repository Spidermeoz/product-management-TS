// controllers/admin/products.controller.ts
import { Request, Response } from "express";
import { RequestHandler } from "express";
import Product from "../../models/product.model";
import { makeFilterStatus, Status } from "../../helpers/filterStatus.helper";
import { makeSearch } from "../../helpers/search.helper";
import { makePagination } from "../../helpers/pagination.helper";
import { systemConfig } from "../../config/config";

type SortKey = "position" | "price" | "title" | "createdAt";
type SortDir = "asc" | "desc";

interface ProductsQuery {
  page?: string;
  status?: Status | "";
  keyword?: string;
  sort?: string; // dạng "price-desc"
  sortKey?: SortKey; // dạng cũ
  sortValue?: SortDir; // dạng cũ
}

interface ProductFind {
  deleted: boolean;
  status?: Status;
  $or?: unknown[];
  [key: string]: unknown;
}

interface EditParams {
  id: string;
}

type ChangeMultiType = "active" | "inactive" | "delete-all" | "change-position";

interface ChangeMultiBody {
  type?: ChangeMultiType;
  ids?: string | string[]; // "id1,id2" hoặc ["id1","id2"]
}

interface CreateProductBody {
  title: string;
  description?: string;
  price: string | number;
  discountPercentage?: string | number;
  stock?: string | number;
  thumbnail?: string;
  position?: string | number;
  status?: Status;
}

interface EditBody {
  title?: string;
  description?: string;
  price?: string | number;
  discountPercentage?: string | number;
  stock?: string | number;
  thumbnail?: string;
  position?: string | number;
  status?: Status;
}

const toInt = (v: unknown, def = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
  }
  return def;
};

const toOptInt = (v: unknown): number | undefined => {
  if (v === undefined || v === null) return undefined;
  const s = typeof v === "string" ? v.trim() : String(v);
  if (s === "") return undefined;
  const n = typeof v === "number" ? v : parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
};

const isChangeType = (t: unknown): t is ChangeMultiType =>
  t === "active" ||
  t === "inactive" ||
  t === "delete-all" ||
  t === "change-position";

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

  // ===== Sort (an toàn & linh hoạt) =====
  const ALLOWED_KEYS: SortKey[] = ["position", "price", "title", "createdAt"];
  const isKey = (k: unknown): k is SortKey =>
    typeof k === "string" && ALLOWED_KEYS.includes(k as SortKey);
  const isDir = (d: unknown): d is SortDir => d === "asc" || d === "desc";

  // sort object sạch (không prototype)
  const sort: Record<string, 1 | -1> = Object.create(null);

  // Ưu tiên kiểu cũ: ?sortKey=price&sortValue=desc
  if (isKey(req.query.sortKey) && isDir(req.query.sortValue)) {
    sort[req.query.sortKey] = req.query.sortValue === "asc" ? 1 : -1;
  } else if (typeof req.query.sort === "string") {
    // Hỗ trợ kiểu mới: ?sort=price-desc
    const [k, d] = req.query.sort.split("-", 2);
    if (isKey(k) && isDir(d)) {
      sort[k] = d === "asc" ? 1 : -1;
    }
  }

  // Fallback mặc định
  if (!Object.keys(sort).length) {
    sort.position = -1; // position desc
  }
  // Secondary key cho ổn định
  if (!("createdAt" in sort)) {
    sort.createdAt = -1;
  }

  // ===== Query + collation khi sort theo title =====
  let query = Product.find(find);
  if ("title" in sort) {
    query = query.collation({ locale: "vi", strength: 1 }); // A–Z tiếng Việt
  }

  // Lấy dữ liệu trang hiện tại
  const productsData = await Product.find(find)
    .sort(sort)
    .limit(pagination.limitItems)
    .skip(pagination.skip)
    .lean();

  // (Tuỳ chọn) gửi selected để prefill client (nếu cần)
  const primaryKey = (Object.keys(sort).find((k) => k !== "createdAt") ||
    "position") as SortKey;
  const selectedSort = `${primaryKey}-${
    sort[primaryKey] === 1 ? "asc" : "desc"
  }`;

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
        req.flash(
          "success",
          `${idList.length} sản phẩm được cập nhật trạng thái thành công!`
        );
        break;

      case "inactive":
        await Product.updateMany(
          { _id: { $in: idList } },
          { $set: { status: "inactive" } }
        );
        req.flash(
          "success",
          `${idList.length} sản phẩm được cập nhật trạng thái thành công!`
        );
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
          await Product.updateOne(
            { _id: id },
            { position: parseInt(position) }
          );
        }
        req.flash(
          "success",
          `${idList.length} sản phẩm được đổi vị trí thành công!`
        );
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
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const id = req.params.id;

  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );

  res.redirect(req.headers.referer);
};

// [GET] /admin/products/create
export const create = async (req: Request, res: Response): Promise<void> => {
  res.render("admin/pages/products/create", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
  });
};

// [POST] /admin/products/create
export const createPost = async (
  req: Request<unknown, unknown, CreateProductBody>,
  res: Response
): Promise<void> => {
  try {
    const { body } = req;

    const price = toInt(body.price, 0);
    const discountPercentage = toInt(body.discountPercentage, 0);
    const stock = toInt(body.stock, 0);

    // position auto tăng nếu bỏ trống
    let position: number;
    const rawPos = body.position;
    if (
      rawPos === undefined ||
      rawPos === null ||
      String(rawPos).trim() === ""
    ) {
      const count = await Product.countDocuments({ deleted: false });
      position = count + 1;
    } else {
      position = toInt(rawPos, 1);
    }

    const thumbnail =
      typeof req.body.thumbnail === "string" && req.body.thumbnail.trim()
        ? req.body.thumbnail.trim()
        : undefined;

    const payload: any = {
      title: body.title,
      description: body.description,
      price,
      discountPercentage,
      stock,
      position,
      status: body.status ?? "active",
      ...(thumbnail ? { thumbnail } : {}),
    };
    // if (thumbnail) payload.thumbnail = thumbnail; // chỉ set khi có file

    const product = new Product(payload);
    await product.save();

    req.flash?.("success", "Tạo sản phẩm thành công!");
    res.redirect(`/${systemConfig.prefixAdmin}/products`);
  } catch (err) {
    console.error("[createPost] error:", err);
    req.flash?.("error", "Tạo sản phẩm thất bại!");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [GET] /admin/products/edit/:id
export const edit = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Product.findOne(find).lean();

    if (!product) {
      req.flash?.("error", "Sản phẩm không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/products`);
      return;
    }

    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      activePage: "products",
      product,
    });
  } catch (error) {
    console.error("[products.edit] error:", error);
    req.flash?.("error", "Sản phẩm không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit/:id
export const editPatch: RequestHandler<EditParams, any, EditBody> = async (
  req,
  res
) => {
  const { id } = req.params;
  const referer = req.get("referer") || `/${systemConfig.prefixAdmin}/products`;

  try {
    const update: Record<string, unknown> = {};

    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined)
      update.description = req.body.description;

    const price = toOptInt(req.body.price);
    if (price !== undefined) update.price = price;

    const discount = toOptInt(req.body.discountPercentage);
    if (discount !== undefined) update.discountPercentage = discount;

    const stock = toOptInt(req.body.stock);
    if (stock !== undefined) update.stock = stock;

    const position = toOptInt(req.body.position);
    if (position !== undefined) update.position = position;

    if (req.body.status === "active" || req.body.status === "inactive") {
      update.status = req.body.status;
    }

    const cloudThumb =
      typeof req.body.thumbnail === "string" && req.body.thumbnail.trim()
        ? req.body.thumbnail.trim()
        : "";

    if (cloudThumb) {
      update.thumbnail = cloudThumb; // <-- cập nhật link Cloudinary nếu có file mới
    }

    await Product.updateOne({ _id: id }, { $set: update });

    req.flash?.("success", "Cập nhật sản phẩm thành công!");
  } catch (error) {
    console.error("[editPatch] error:", error);
    req.flash?.("error", "Cập nhật sản phẩm thất bại!");
  }

  res.redirect(referer);
};

// [GET] /admin/products/detail/:id
export const detail = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id,
    }).lean();

    if (!product) {
      req.flash?.("error", "Sản phẩm không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/products`);
      return;
    }

    res.render("admin/pages/products/detail", {
      pageTitle: product.title || "Chi tiết sản phẩm",
      product,
      activePage: "products",
    });
  } catch (error) {
    console.error("[products.detail] error:", error);
    req.flash?.("error", "Sản phẩm không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/products`);
  }
};
