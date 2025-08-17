import { Request, Response } from "express";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import md5 from "md5"

interface AccountFind {
  deleted: boolean;
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
    const rawEmail = String(req.body.email ?? "").trim().toLowerCase();
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
    req.flash?.("error", "Lỗi khi tạo tài khoản: " + (error?.message || String(error)));
    res.redirect(referer);
  }
};
