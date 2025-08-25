"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = void 0;
const validateLogin = (req, res, next) => {
    var _a, _b, _c, _d, _e, _f;
    const referer = req.get("referer") || "/";
    const email = String((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "").trim();
    const password = String((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.password) !== null && _d !== void 0 ? _d : "").trim();
    if (!email) {
        (_e = req.flash) === null || _e === void 0 ? void 0 : _e.call(req, "error", "Vui lòng nhập email!");
        res.redirect(referer);
        return;
    }
    if (!password) {
        (_f = req.flash) === null || _f === void 0 ? void 0 : _f.call(req, "error", "Vui lòng nhập mật khẩu!");
        res.redirect(referer);
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
