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
exports.deleteItem = exports.detail = exports.editPatch = exports.edit = exports.changeStatus = exports.createPost = exports.create = exports.index = void 0;
const config_1 = require("../../config/config");
const account_model_1 = __importDefault(require("../../models/account.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = { deleted: false };
    const records = yield account_model_1.default.find(find).lean().select("-password -token");
    for (const account of records) {
        if (account.createdBy && account.createdBy.account_id) {
            const user = yield account_model_1.default.findOne({
                _id: account.createdBy.account_id,
            }).lean();
            if (user) {
                account["accountFullName"] = user.fullName;
            }
        }
        let updatedBy = null;
        let userUpdated = null;
        if (account.updatedBy && account.updatedBy.length > 0) {
            updatedBy = account.updatedBy.slice(-1)[0];
            if (updatedBy.account_id) {
                userUpdated = yield account_model_1.default.findOne({
                    _id: updatedBy.account_id,
                }).lean();
            }
        }
        if (userUpdated) {
            updatedBy["accountFullName"] = userUpdated.fullName;
        }
    }
    for (const record of records) {
        const role = yield role_model_1.default.findOne({
            _id: record.role_id,
            deleted: false,
        });
        record["role"] = role;
    }
    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        activePage: "accounts",
        records,
    });
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = { deleted: false };
    const roles = yield role_model_1.default.find(find).lean();
    res.render("admin/pages/accounts/create", {
        pageTitle: "Tạo tài khoản",
        activePage: "accounts",
        roles,
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const referer = req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/accounts`;
    try {
        const rawEmail = String((_a = req.body.email) !== null && _a !== void 0 ? _a : "")
            .trim()
            .toLowerCase();
        const rawPassword = String((_b = req.body.password) !== null && _b !== void 0 ? _b : "");
        if (!rawEmail) {
            (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Vui lòng nhập email!");
            res.redirect(referer);
            return;
        }
        if (!rawPassword) {
            (_d = req.flash) === null || _d === void 0 ? void 0 : _d.call(req, "error", "Vui lòng nhập mật khẩu!");
            res.redirect(referer);
            return;
        }
        const emailExist = yield account_model_1.default.findOne({
            email: rawEmail,
            deleted: false,
        }).lean();
        if (emailExist) {
            (_e = req.flash) === null || _e === void 0 ? void 0 : _e.call(req, "error", "Email đã tồn tại, vui lòng dùng email khác!");
            res.redirect(referer);
            return;
        }
        req.body.createdBy = {
            account_id: res.locals.authUser._id || "",
        };
        const payload = Object.assign(Object.assign({}, req.body), { email: rawEmail, password: (0, md5_1.default)(rawPassword) });
        const record = new account_model_1.default(payload);
        yield record.save();
        (_f = req.flash) === null || _f === void 0 ? void 0 : _f.call(req, "success", "Tạo tài khoản thành công!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
    catch (error) {
        console.error("[accounts.createPost] error:", error);
        (_g = req.flash) === null || _g === void 0 ? void 0 : _g.call(req, "error", "Lỗi khi tạo tài khoản: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        res.redirect(referer);
    }
});
exports.createPost = createPost;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const id = req.params.id;
    const updatedBy = {
        account_id: res.locals.authUser._id,
        updatedAt: new Date(),
    };
    yield account_model_1.default.updateOne({ _id: id }, {
        status: status,
        $push: {
            updatedBy: updatedBy,
        },
    });
    req.flash("success", "Thay đổi trạng thái tài khoản thành công!");
    res.redirect(req.headers.referer);
});
exports.changeStatus = changeStatus;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false, _id: req.params.id };
        const data = yield account_model_1.default.findOne(find);
        const findData = { deleted: false };
        const roles = yield role_model_1.default.find(findData);
        if (!data) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Tài khoản không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
            return;
        }
        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            activePage: "accounts",
            data,
            roles,
        });
    }
    catch (error) {
        console.error("[products.edit] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Tài khoản không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const referer = req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/accounts`;
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
            if (req.body.role_id) {
                update.role_id = req.body.role_id;
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
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Cập nhật tài khoản thành công!");
        }
    }
    catch (error) {
        console.error("[editPatch] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Cập nhật tài khoản thất bại!");
    }
    res.redirect(referer);
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false, _id: req.params.id };
        const data = yield account_model_1.default.findOne(find);
        if (!data) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Tài khoản không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
            return;
        }
        const findData = { deleted: false, _id: data.role_id };
        const role = yield role_model_1.default.findOne(findData);
        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi tiết tài khoản",
            activePage: "accounts",
            data,
            role,
        });
    }
    catch (error) {
        console.error("[accounts.detail] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Tài khoản không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/accounts`);
    }
});
exports.detail = detail;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield account_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
        },
    });
    req.flash("success", "Xóa tài khoản thành công!");
    res.redirect(req.headers.referer);
});
exports.deleteItem = deleteItem;
