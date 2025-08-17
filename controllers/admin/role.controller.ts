import { Request, Response } from "express";
import { systemConfig } from "../../config/config";
import { Status } from "cloudinary";
import Role from "../../models/role.model";

interface RoleFind {
  deleted: boolean;
  $or?: unknown[];
  [key: string]: unknown;
}

interface CreateRoleBody {
  title: string;
  description?: string;
}
// [GET] /admin/roles
export const index = async (
  req: Request,
  res: Response
): Promise<void> => {

  // Điều kiện Mongo
  const find: RoleFind = { deleted: false };

  // Lấy dữ liệu trang hiện tại
  const roles = await Role.find(find)
    .lean();

  // Render
  res.render("admin/pages/roles/index", {
    pageTitle: "Danh sách nhóm quyền",
    activePage: "roles",
    roles,
  });
};

// [GET] /admin/roles/create
export const create = async (req: Request, res: Response): Promise<void> => {
  try {res.render("admin/pages/roles/create", {
      pageTitle: "Tạo mới danh mục sản phẩm",
      activePage: "roles"
    });
  } catch (error) {
    console.error("[roles.create] error:", error);
    // Nếu có connect-flash:
    (req as any).flash?.("error", "Không thể tải tạo mới nhóm quyền!");
    res.redirect("/admin"); // hoặc route phù hợp trong hệ thống của bạn
  }
};

// [POST] /admin/roles/create
export const createPost = async (
  req: Request<unknown, unknown, CreateRoleBody>,
  res: Response
): Promise<void> => {
  try {
    const { body } = req;
    const payload: any = {
      title: body.title,
      description: body.description,
    };

    const role = new Role(payload);
    await role.save();
    
    req.flash?.("success", "Tạo nhóm quyền mới thành công!");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (err) {
    console.error("[createPost] error:", err);
    req.flash?.("error", "Tạo nhóm quyền mới thất bại!");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};