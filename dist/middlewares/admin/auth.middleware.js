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
exports.requireAuth = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const config_1 = require("../../config/config");
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        if (!token) {
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        const user = yield account_model_1.default.findOne({ token }).select("-password").lean();
        if (!user) {
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
        const role = yield role_model_1.default.findOne({ _id: user.role_id })
            .select("title permissions")
            .lean();
        res.locals.authUser = user;
        res.locals.authRole = role || null;
        next();
    }
    catch (err) {
        console.error("[requireAuth] error:", err);
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/auth/login`);
    }
});
exports.requireAuth = requireAuth;
