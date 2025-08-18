import { Request, Response, NextFunction } from "express";

export const validateLogin= (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const referer = req.get("referer") || "/";

  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "").trim();

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