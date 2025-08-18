import { Request, Response } from "express";
import { systemConfig } from "../../config/config";
import Account from "../../models/account.model";
import md5 from "md5";

type AccountStatus = "active" | "inactive";

interface AccountLean {
  _id: string;
  email: string;
  password: string;
  status: AccountStatus;
  token: string;
  deleted: boolean;
}

interface LoginBody {
  email: string;
  password: string;
}

// [GET] /auth/login
export const index = async (req: Request, res: Response): Promise<void> => {
  // Render
  res.render("admin/pages/auth/login", {
    pageTitle: "Đăng nhập",
  });
};

// [POST] /auth/login
export const loginPost = async (
  req: Request<unknown, unknown, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";

    if (!email || !password) {
      req.flash?.("error", "Vui lòng nhập email và mật khẩu!");
      res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    const user = await Account.findOne({ email, deleted: false })
      .lean<AccountLean>();

    if (!user) {
      req.flash?.("error", "Email không tồn tại!");
      res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    if (md5(password) !== user.password) {
      req.flash?.("error", "Mật khẩu không chính xác!");
      res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    if (user.status === "inactive") {
      req.flash?.("error", "Tài khoản đã bị khóa!");
      res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    // Set cookie token (tùy chỉnh thêm secure/maxAge nếu cần)
    res.cookie("token", user.token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: process.env.NODE_ENV === "production",
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
  } catch (err) {
    console.error("[auth.loginPost] error:", err);
    req.flash?.("error", "Đăng nhập thất bại, vui lòng thử lại!");
    res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/auth/login`);
  }
};

// [GET] /admin/auth/logout
export const logout = (req: Request, res: Response): void => {
  // Xóa cookie "token".
  // LƯU Ý: nếu lúc set cookie bạn có dùng path/domain/sameSite/secure,
  // hãy truyền lại đúng các option đó để đảm bảo xóa được.
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      // secure: process.env.NODE_ENV === "production",
      // path: "/",           // đảm bảo khớp với lúc set
      // domain: "your.domain"// nếu có
    });
  } catch {
    // ignore
  } finally {
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
  }
};