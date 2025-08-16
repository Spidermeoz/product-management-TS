// controllers/admin/products-category.controller.ts
import { Request, Response } from "express";
import ProductCategory from "../../models/product-category.model";
import { systemConfig } from "../../config/config";
import { Status } from "../../helpers/filterStatus.helper";
import { buildCategoryTree } from "../../helpers/createTree.helper";

interface CategoryFind {
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

const toInt = (v: unknown, def = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
  }
  return def;
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
