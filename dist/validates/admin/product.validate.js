"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditRole = exports.validateCreateProductCategory = exports.validateCreatePost = void 0;
const validateCreatePost = (req, res, next) => {
    var _a, _b, _c;
    const title = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.title) === "string" ? req.body.title.trim() : "";
    if (!title) {
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Vui lòng nhập tiêu đề");
        return res.redirect(req.headers.referer);
    }
    if (!req.body.product_category_id) {
        (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Vui lòng chọn danh mục");
        return res.redirect(req.headers.referer);
    }
    return next();
};
exports.validateCreatePost = validateCreatePost;
const validateCreateProductCategory = (req, res, next) => {
    var _a, _b, _c;
    const title = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.title) === "string" ? req.body.title.trim() : "";
    if (!title) {
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Vui lòng nhập tiêu đề");
        return res.redirect(req.headers.referer);
    }
    if (!req.body.parent_id) {
        (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Vui lòng chọn danh mục");
        return res.redirect(req.headers.referer);
    }
    return next();
};
exports.validateCreateProductCategory = validateCreateProductCategory;
const validateEditRole = (req, res, next) => {
    var _a, _b;
    const title = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.title) === "string" ? req.body.title.trim() : "";
    if (!title) {
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Vui lòng nhập tiêu đề");
        return res.redirect(req.headers.referer);
    }
    return next();
};
exports.validateEditRole = validateEditRole;
