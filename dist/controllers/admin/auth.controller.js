"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginPost = exports.index = void 0;
const config_1 = require("../../config/config");
const account_model_1 = __importDefault(require("../../models/account.model"));
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (token) {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/dashboard`);
        return;
    }
    res.render("admin/pages/auth/login", { pageTitle: "Đăng nhập" });
});
exports.index = index;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const email = (req.body.email || "").trim();
        const password = req.body.password || "";
        if (!email || !password) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Vui lòng nhập email và mật khẩu!");
            res.redirect(req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        const user = yield account_model_1.default.findOne({
            email,
            deleted: false,
        }).lean();
        if (!user) {
            (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Email không tồn tại!");
            res.redirect(req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        if ((0, md5_1.default)(password) !== user.password) {
            (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Mật khẩu không chính xác!");
            res.redirect(req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        if (user.status === "inactive") {
            (_d = req.flash) === null || _d === void 0 ? void 0 : _d.call(req, "error", "Tài khoản đã bị khóa!");
            res.redirect(req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        res.cookie("token", user.token, {
            httpOnly: true,
            sameSite: "lax",
        });
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/dashboard`);
    }
    catch (err) {
        console.error("[auth.loginPost] error:", err);
        (_e = req.flash) === null || _e === void 0 ? void 0 : _e.call(req, "error", "Đăng nhập thất bại, vui lòng thử lại!");
        res.redirect(req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/auth/login`);
    }
});
exports.loginPost = loginPost;
const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
        });
    }
    catch (_a) {
    }
    finally {
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/auth/login`);
    }
};
exports.logout = logout;
