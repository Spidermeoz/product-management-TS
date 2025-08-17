// controllers/admin/products-category.controller.ts
import { Request, Response, RequestHandler } from "express";
import ProductCategory from "../../models/product-category.model";
import { systemConfig } from "../../config/config";
import { Status } from "../../helpers/filterStatus.helper";
import { buildCategoryTree } from "../../helpers/createTree.helper";

interface CategoryFind {
  id?: string;
  deleted: boolean;
  [key: string]: unknown;
}

interface CreateProductCategoryBody {
  parent_id: any;
  title: string;
  description?: string;
  thumbnail?: string;
  position?: string | number;
  status?: Status;
}

interface EditParams {
  id: string;
}

interface EditBody {
  title?: string;
  description?: string;
  parent_id?: string;
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

// [GET] /admin/products-category
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const find: CategoryFind = { deleted: false };
    const records = await ProductCategory.find(find).lean();
    const tree = buildCategoryTree(records, { sortBy: "position", dir: 1 });

    res.render("admin/pages/products-category/index", {
      pageTitle: "Danh mục sản phẩm",
      activePage: "products-category",
      records: tree,
    });
  } catch (error) {
    console.error("[products-category.index] error:", error);
    // Nếu có connect-flash:
    (req as any).flash?.("error", "Không thể tải danh mục sản phẩm!");
    res.redirect("/admin"); // hoặc route phù hợp trong hệ thống của bạn
  }
};

// [GET] /admin/products-category/create
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const find: CategoryFind = { deleted: false };
    const records = await ProductCategory.find(find).lean();
    const tree = buildCategoryTree(records, { sortBy: "position", dir: 1 });

    res.render("admin/pages/products-category/create", {
      pageTitle: "Tạo mới danh mục sản phẩm",
      activePage: "products-category",
      records: tree
    });
  } catch (error) {
    console.error("[products-category.create] error:", error);
    // Nếu có connect-flash:
    (req as any).flash?.("error", "Không thể tải tạo mới danh mục sản phẩm!");
    res.redirect("/admin"); // hoặc route phù hợp trong hệ thống của bạn
  }
};

// [POST] /admin/products-category/create
export const createPost = async (
  req: Request<unknown, unknown, CreateProductCategoryBody>,
  res: Response
): Promise<void> => {
  try {
    const { body } = req;

    // position auto tăng nếu bỏ trống
    let position: number;
    const rawPos = body.position;
    if (
      rawPos === undefined ||
      rawPos === null ||
      String(rawPos).trim() === ""
    ) {
      const count = await ProductCategory.countDocuments({ deleted: false });
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
      position,
      parent_id: body.parent_id,
      status: body.status ?? "active",
      ...(thumbnail ? { thumbnail } : {}),
    };

    const productCategory = new ProductCategory(payload);
    await productCategory.save();

    req.flash?.("success", "Tạo danh mục mới thành công!");
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  } catch (err) {
    console.error("[createPost] error:", err);
    req.flash?.("error", "Tạo danh mục mới thất bại!");
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// [GET] /admin/products-category/edit/:id
export const edit = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const find: CategoryFind = { deleted: false };
    const records = await ProductCategory.find(find).lean();
    const tree = buildCategoryTree(records, { sortBy: "position", dir: 1 });

    const findData: CategoryFind = { deleted: false, _id: req.params.id};
    const data = await ProductCategory.findOne(findData)

    if (!data) {
      req.flash?.("error", "Danh mục sản phẩm không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
      return;
    }
    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      activePage: "products-category",
      data: data,
      records: tree,
    });
  } catch (error) {
    console.error("[products.edit] error:", error);
    req.flash?.("error", "Danh mục sản phẩm không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit/:id
export const editPatch: RequestHandler<EditParams, any, EditBody> = async (
  req,
  res
) => {
  const { id } = req.params;
  const referer = req.get("referer") || `/${systemConfig.prefixAdmin}/products`;

  try {
    const update: Record<string, unknown> = {};

    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.parent_id !== undefined) {
      update.parent_id = req.body.parent_id;
    }
    if (req.body.description !== undefined)
      update.description = req.body.description;

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

    await ProductCategory.updateOne({ _id: id }, { $set: update });

    req.flash?.("success", "Cập nhật danh mục sản phẩm thành công!");
  } catch (error) {
    console.error("[editPatch] error:", error);
    req.flash?.("error", "Cập nhật danh mục sản phẩm thất bại!");
  }

  res.redirect(referer);
};

