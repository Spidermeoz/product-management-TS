// validates/admin/user.validate.ts
import { Request, Response, NextFunction } from "express";

export const validateCreateAccount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const referer = req.get("referer") || "/";

  const fullName = String(req.body?.fullName ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "").trim();

  if (!fullName) {
    req.flash?.("error", "Vui lòng nhập họ tên!");
    res.redirect(referer);
    return;
  }

  if (!email) {
    req.flash?.("error", "Vui lòng nhập email!");
    res.redirect(referer);
    return;
  }

  if (!password) {
    req.flash?.("error", "Vui lòng nhập mật khẩu!");
    res.redirect(referer);
    return;
  }

  next();
};

export const validateEditAccount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const referer = req.get("referer") || "/";

  const fullName = String(req.body?.fullName ?? "").trim();
  const email = String(req.body?.email ?? "").trim();

  if (!fullName) {
    req.flash?.("error", "Vui lòng nhập họ tên!");
    res.redirect(referer);
    return;
  }

  if (!email) {
    req.flash?.("error", "Vui lòng nhập email!");
    res.redirect(referer);
    return;
  }

  next();
};