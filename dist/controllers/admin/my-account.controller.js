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
exports.editPatch = exports.edit = exports.index = void 0;
const config_1 = require("../../config/config");
const account_model_1 = __importDefault(require("../../models/account.model"));
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("admin/pages/my-account/index", {
        pageTitle: "Thông tin cá nhân",
    });
});
exports.index = index;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("admin/pages/my-account/edit", {
        pageTitle: "Chỉnh sửa thông tin cá nhân",
    });
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = res.locals.authUser._id;
    console.log("[editPatch] id:", id);
    const referer = req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/my-account`;
    try {
        const update = {};
        const findEmail = {
            _id: { $ne: id },
            email: req.body.email,
            deleted: false,
        };
        const emailExist = yield account_model_1.default.findOne(findEmail);
        if (emailExist) {
            req.flash("error", "Email đã tồn tại, vui lòng dùng email khác!");
        }
        else {
            if (req.body.fullName)
                update.fullName = req.body.fullName;
            if (req.body.email)
                update.email = req.body.email;
            if (req.body.password) {
                update.password = (0, md5_1.default)(req.body.password);
            }
            else {
                delete req.body.password;
            }
            if (req.body.status === "active" || req.body.status === "inactive") {
                update.status = req.body.status;
            }
            const cloudThumb = typeof req.body.avatar === "string" && req.body.avatar.trim()
                ? req.body.avatar.trim()
                : "";
            if (cloudThumb) {
                update.avatar = cloudThumb;
            }
            const updatedBy = {
                account_id: res.locals.authUser._id,
                updatedAt: new Date(),
            };
            yield account_model_1.default.updateOne({ _id: id }, {
                $set: update,
                $push: {
                    updatedBy: updatedBy,
                },
            });
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Cập nhật thông tin thành công!");
        }
    }
    catch (error) {
        console.error("[editPatch] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Cập nhật thông tin thất bại!");
    }
    res.redirect(referer);
});
exports.editPatch = editPatch;
