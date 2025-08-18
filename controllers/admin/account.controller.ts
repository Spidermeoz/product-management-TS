import { Request, Response, RequestHandler } from "express";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import md5 from "md5";
import { Status } from "cloudinary";

interface AccountFind {
  deleted: boolean;
  _id?: string | Record<string, unknown>;
  email?: string;
  $or?: unknown[];
  [key: string]: unknown;
}

interface RoleFind {
  deleted: boolean;
  $or?: unknown[];
  [key: string]: unknown;
}

interface CreateAccountBody {
  fullName?: string;
  email?: string;
  password?: string;
  roleId?: string;
  [key: string]: unknown;
}

interface EditParams {
  id: string;
}

interface EditBody {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role_id?: string;
  status?: Status;
}

// [GET] /admin/accounts
export const index = async (req: Request, res: Response): Promise<void> => {
  // Điều kiện Mongo
  const find: AccountFind = { deleted: false };

  // Lấy dữ liệu trang hiện tại
  const records = await Account.find(find).lean().select("-password -token");

  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false,
    });
    record["role"] = role;
  }

  // Render
  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    activePage: "accounts",
    records,
  });
};

// [GET] /admin/accounts/create
export const create = async (req: Request, res: Response): Promise<void> => {
  // Điều kiện Mongo
  const find: RoleFind = { deleted: false };

  // Lấy dữ liệu trang hiện tại
  const roles = await Role.find(find).lean();

  // Render
  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo tài khoản",
    activePage: "accounts",
    roles,
  });
};

// [POST] /admin/accounts/create
export const createPost = async (
  req: Request<unknown, unknown, CreateAccountBody>,
  res: Response
): Promise<void> => {
  const referer = req.get("referer") || `/${systemConfig.prefixAdmin}/accounts`;

  try {
    const rawEmail = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const rawPassword = String(req.body.password ?? "");

    if (!rawEmail) {
      req.flash?.("error", "Vui lòng nhập email!");
      res.redirect(referer);
      return;
    }
    if (!rawPassword) {
      req.flash?.("error", "Vui lòng nhập mật khẩu!");
      res.redirect(referer);
      return;
    }

    // Kiểm tra email tồn tại (chỉ lấy bản ghi chưa xoá)
    const emailExist = await Account.findOne({
      email: rawEmail,
      deleted: false,
    }).lean();

    if (emailExist) {
      req.flash?.("error", "Email đã tồn tại, vui lòng dùng email khác!");
      res.redirect(referer);
      return;
    }

    // Tạo tài khoản mới
    const payload: Record<string, unknown> = {
      ...req.body,
      email: rawEmail,
      password: md5(rawPassword),
    };

    const record = new Account(payload);
    await record.save();

    req.flash?.("success", "Tạo tài khoản thành công!");
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  } catch (error: any) {
    console.error("[accounts.createPost] error:", error);
    req.flash?.(
      "error",
      "Lỗi khi tạo tài khoản: " + (error?.message || String(error))
    );
    res.redirect(referer);
  }
};

// [GET] /admin/accounts/edit/:id
export const edit = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const find: AccountFind = { deleted: false, _id: req.params.id };
    const data = await Account.findOne(find);

    const findData: RoleFind = { deleted: false };
    const roles = await Role.find(findData);

    if (!data) {
      req.flash?.("error", "Tài khoản không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
      return;
    }
    res.render("admin/pages/accounts/edit", {
      pageTitle: "Chỉnh sửa tài khoản",
      activePage: "accounts",
      data,
      roles,
    });
  } catch (error) {
    console.error("[products.edit] error:", error);
    req.flash?.("error", "Tài khoản không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
};

// [PATCH] /admin/accounts/edit/:id
export const editPatch: RequestHandler<EditParams, any, EditBody> = async (
  req,
  res
) => {
  const { id } = req.params;
  const referer = req.get("referer") || `/${systemConfig.prefixAdmin}/accounts`;

  try {
    const update: Record<string, unknown> = {};

    const findEmail: AccountFind = {
      _id: { $ne: id }, //ne = not equal
      email: req.body.email,
      deleted: false,
    };

    const emailExist = await Account.findOne(findEmail);

    if (emailExist) {
      req.flash("error", "Email đã tồn tại, vui lòng dùng email khác!");
    } else {
      if (req.body.fullName) update.fullName = req.body.fullName;
      if (req.body.email) update.email = req.body.email;
      if (req.body.password) {
        update.password = md5(req.body.password);
      } else {
        delete req.body.password;
      }

      if (req.body.role_id) {
        update.role_id = req.body.role_id;
      }

      if (req.body.status === "active" || req.body.status === "inactive") {
        update.status = req.body.status;
      }

      const cloudThumb =
        typeof req.body.avatar === "string" && req.body.avatar.trim()
          ? req.body.avatar.trim()
          : "";

      if (cloudThumb) {
        update.avatar = cloudThumb; // <-- cập nhật link Cloudinary nếu có file mới
      }

      await Account.updateOne({ _id: id }, { $set: update });

      req.flash?.("success", "Cập nhật tài khoản thành công!");
    }
  } catch (error) {
    console.error("[editPatch] error:", error);
    req.flash?.("error", "Cập nhật tài khoản thất bại!");
  }

  res.redirect(referer);
};

// [GET] /admin/accounts/detail/:id
export const detail = async (
  req: Request<EditParams>,
  res: Response
): Promise<void> => {
  try {
    const find: AccountFind = { deleted: false, _id: req.params.id };
    const data = await Account.findOne(find);
    
    if (!data) {
      req.flash?.("error", "Tài khoản không tồn tại!");
      res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
      return;
    }

    const findData: RoleFind = { deleted: false , _id: data.role_id};
    const role = await Role.findOne(findData);

    res.render("admin/pages/accounts/detail", {
      pageTitle: "Chi tiết tài khoản",
      activePage: "accounts",
      data,
      role,
    });
  } catch (error) {
    console.error("[accounts.detail] error:", error);
    req.flash?.("error", "Tài khoản không tồn tại!");
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
};
