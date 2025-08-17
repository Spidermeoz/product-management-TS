import { Request, Response, RequestHandler } from "express";
import { systemConfig } from "../../config/config";
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

interface EditParams {
  id: string;
}

interface EditBody {
  title?: string;
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

// [GET] /admin/roles/detail/:id
export const detail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const findData: RoleFind = { deleted: false, _id: req.params.id};
    const role = await Role.findOne(findData).lean();

    if (!role) {
      req.flash?.("error", "Nhóm quyền không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/roles`);
      return;
    }

    res.render("admin/pages/roles/detail", {
      pageTitle: role.title || "Chi tiết nhóm quyền",
      role,
      activePage: "roles",
    });
  } catch (error) {
    console.error("[roles.detail] error:", error);
    req.flash?.("error", "Nhóm quyền không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/edit/:id
export const edit = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const findData: RoleFind = { deleted: false, _id: req.params.id};
    const role = await Role.findOne(findData)

    if (!role) {
      req.flash?.("error", "Nhóm quyền không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/roles`);
      return;
    }
    res.render("admin/pages/roles/edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      activePage: "roles",
      role: role,
    });
  } catch (error) {
    console.error("[roles.edit] error:", error);
    req.flash?.("error", "Nhóm quyền không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/edit/:id
export const editPatch: RequestHandler<EditParams, any, EditBody> = async (
  req,
  res
) => {
  const { id } = req.params;
  const referer = req.get("referer") || `/${systemConfig.prefixAdmin}/roles`;

  try {
    const update: Record<string, unknown> = {};

    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined)
      update.description = req.body.description;

    await Role.updateOne({ _id: id }, { $set: update });

    req.flash?.("success", "Cập nhật nhóm quyền thành công!");
  } catch (error) {
    console.error("[editPatch] error:", error);
    req.flash?.("error", "Cập nhật nhóm quyền thất bại!");
  }

  res.redirect(referer);
};

// [DELETE] /admin/products/delete/:id
export const deleteItem = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const id = req.params.id;

  await Role.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );

  req.flash("success", "Xóa nhóm quyền thành công!");

  res.redirect(req.headers.referer);
};
