import { Request, Response, RequestHandler } from "express";
import { systemConfig } from "../../config/config";
import Role from "../../models/role.model";
import Account from "../../models/account.model";

type PermissionMatrix = Record<string, boolean>;

interface PermissionItem {
  id: string; // _id của role
  permissions: PermissionMatrix; // ví dụ: { "products_view": true, "roles_edit": false, ... }
}

interface RoleFind {
  deleted: boolean;
  $or?: unknown[];
  [key: string]: unknown;
}

interface CreateRoleBody {
  title: string;
  description?: string;
  createdBy?: {
    account_id: string;
    createdAt?: Date;
  };
}

interface EditParams {
  id: string;
}

interface EditBody {
  title?: string;
  description?: string;
}

// [GET] /admin/roles
export const index = async (req: Request, res: Response): Promise<void> => {
  // Điều kiện Mongo
  const find: RoleFind = { deleted: false };

  // Lấy dữ liệu trang hiện tại
  const roles = await Role.find(find).lean();

  for (const role of roles) {
    if (role.createdBy && role.createdBy.account_id) {
      const user = await Account.findOne({
        _id: role.createdBy.account_id,
      }).lean();
      if (user) {
        role["accountFullName"] = user.fullName;
      }
    }
  }

  // Render
  res.render("admin/pages/roles/index", {
    pageTitle: "Danh sách nhóm quyền",
    activePage: "roles",
    roles,
  });
};

// [GET] /admin/roles/create
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    res.render("admin/pages/roles/create", {
      pageTitle: "Tạo mới danh mục sản phẩm",
      activePage: "roles",
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

    body.createdBy = {
      account_id: res.locals.authUser._id || "",
    };

    const createdBy = body.createdBy;

    const payload: any = {
      title: body.title,
      description: body.description,
      createdBy,
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
export const detail = async (req: Request, res: Response): Promise<void> => {
  try {
    const findData: RoleFind = { deleted: false, _id: req.params.id };
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
    const findData: RoleFind = { deleted: false, _id: req.params.id };
    const role = await Role.findOne(findData);

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
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.authUser._id,
        deletedAt: new Date(),
      },
    }
  );

  req.flash("success", "Xóa nhóm quyền thành công!");

  res.redirect(req.headers.referer);
};

// [GET] /admin/roles/permissions
export const permissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Điều kiện Mongo
  const find: RoleFind = { deleted: false };

  // Lấy dữ liệu trang hiện tại
  const records = await Role.find(find).lean();

  // Render
  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân quyền",
    activePage: "rolePermissions",
    records,
  });
};

// // [PATCH] /admin/roles/permissions
export const permissionsPatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  const referer = req.get("referer") || "/admin/roles/permissions";

  try {
    const raw = req.body?.permissions;
    if (!raw) {
      req.flash?.("error", "Thiếu dữ liệu phân quyền.");
      res.redirect(referer);
      return;
    }

    let payload: PermissionItem[];
    try {
      payload = JSON.parse(raw) as PermissionItem[];
    } catch {
      req.flash?.("error", "Dữ liệu phân quyền không hợp lệ.");
      res.redirect(referer);
      return;
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      req.flash?.("error", "Không có thay đổi nào để cập nhật.");
      res.redirect(referer);
      return;
    }

    // Lọc phần tử hợp lệ và chuẩn bị các promise update
    const updates = payload
      .filter(
        (it) =>
          typeof it?.id === "string" &&
          it.id.trim() !== "" &&
          it.permissions &&
          typeof it.permissions === "object"
      )
      .map((it) =>
        Role.updateOne(
          { _id: it.id },
          { $set: { permissions: it.permissions } }
        )
      );

    if (updates.length === 0) {
      req.flash?.("error", "Không có dữ liệu hợp lệ để cập nhật.");
      res.redirect(referer);
      return;
    }

    await Promise.all(updates);

    req.flash?.("success", "Phân quyền thành công!");
    res.redirect(referer);
  } catch (err) {
    console.error("[roles.permissionsPatch] error:", err);
    req.flash?.("error", "Có lỗi khi lưu phân quyền.");
    res.redirect(referer);
  }
};
