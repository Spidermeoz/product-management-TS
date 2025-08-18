// middlewares/admin/requireAuth.middleware.ts
import { Request, Response, NextFunction } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Nếu chưa có typing cho cookie-parser, dùng (req as any)
    const token = (req as any).cookies?.token as string | undefined;

    if (!token) {
      res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    const user = await Account.findOne({ token }).select("-password").lean();

    if (!user) {
      res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    const role = await Role.findOne({ _id: (user as any).role_id })
      .select("title permissions")
      .lean();

    // Gắn vào locals để dùng trong view
    (res.locals as any).authUser = user;
    (res.locals as any).authRole = role || null;

    next();
  } catch (err) {
    console.error("[requireAuth] error:", err);
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
  }
};
