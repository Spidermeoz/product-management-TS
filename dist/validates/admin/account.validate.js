"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditAccount = exports.validateCreateAccount = void 0;
const validateCreateAccount = (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const referer = req.get("referer") || "/";
    const fullName = String((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.fullName) !== null && _b !== void 0 ? _b : "").trim();
    const email = String((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : "").trim();
    const password = String((_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.password) !== null && _f !== void 0 ? _f : "").trim();
    if (!fullName) {
        (_g = req.flash) === null || _g === void 0 ? void 0 : _g.call(req, "error", "Vui lòng nhập họ tên!");
        res.redirect(referer);
        return;
    }
    if (!email) {
        (_h = req.flash) === null || _h === void 0 ? void 0 : _h.call(req, "error", "Vui lòng nhập email!");
        res.redirect(referer);
        return;
    }
    if (!password) {
        (_j = req.flash) === null || _j === void 0 ? void 0 : _j.call(req, "error", "Vui lòng nhập mật khẩu!");
        res.redirect(referer);
        return;
    }
    next();
};
exports.validateCreateAccount = validateCreateAccount;
const validateEditAccount = (req, res, next) => {
    var _a, _b, _c, _d, _e, _f;
    const referer = req.get("referer") || "/";
    const fullName = String((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.fullName) !== null && _b !== void 0 ? _b : "").trim();
    const email = String((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : "").trim();
    if (!fullName) {
        (_e = req.flash) === null || _e === void 0 ? void 0 : _e.call(req, "error", "Vui lòng nhập họ tên!");
        res.redirect(referer);
        return;
    }
    if (!email) {
        (_f = req.flash) === null || _f === void 0 ? void 0 : _f.call(req, "error", "Vui lòng nhập email!");
        res.redirect(referer);
        return;
    }
    next();
};
exports.validateEditAccount = validateEditAccount;
