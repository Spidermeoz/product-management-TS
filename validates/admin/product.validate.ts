import { RequestHandler } from "express";

export const validateCreatePost: RequestHandler = (req, res, next) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    // Nếu đã khai báo connect-flash typings thì có thể bỏ optional chaining
    req.flash?.("error", "Vui lòng nhập tiêu đề");
    return res.redirect(req.headers.referer); // dựa vào Referer; nếu không có sẽ fallback về "/"
  }

  if (!req.body.product_category_id) {
    // Nếu đã khai báo connect-flash typings thì có thể bỏ optional chaining
    req.flash?.("error", "Vui lòng chọn danh mục");
    return res.redirect(req.headers.referer); // dựa vào Referer; nếu không có sẽ fallback về "/"
  }

  return next();
};

export const validateCreateProductCategory: RequestHandler = (req, res, next) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    // Nếu đã khai báo connect-flash typings thì có thể bỏ optional chaining
    req.flash?.("error", "Vui lòng nhập tiêu đề");
    return res.redirect(req.headers.referer); // dựa vào Referer; nếu không có sẽ fallback về "/"
  }

  if (!req.body.parent_id) {
    // Nếu đã khai báo connect-flash typings thì có thể bỏ optional chaining
    req.flash?.("error", "Vui lòng chọn danh mục");
    return res.redirect(req.headers.referer); // dựa vào Referer; nếu không có sẽ fallback về "/"
  }

  return next();
};

export const validateEditRole: RequestHandler = (req, res, next) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    // Nếu đã khai báo connect-flash typings thì có thể bỏ optional chaining
    req.flash?.("error", "Vui lòng nhập tiêu đề");
    return res.redirect(req.headers.referer); // dựa vào Referer; nếu không có sẽ fallback về "/"
  }

  return next();
};