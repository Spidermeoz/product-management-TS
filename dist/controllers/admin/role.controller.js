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
exports.permissionsPatch = exports.permissions = exports.deleteItem = exports.editPatch = exports.edit = exports.detail = exports.createPost = exports.create = exports.index = void 0;
const config_1 = require("../../config/config");
const role_model_1 = __importDefault(require("../../models/role.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = { deleted: false };
    const roles = yield role_model_1.default.find(find).lean();
    for (const role of roles) {
        if (role.createdBy && role.createdBy.account_id) {
            const user = yield account_model_1.default.findOne({
                _id: role.createdBy.account_id,
            }).lean();
            if (user) {
                role["accountFullName"] = user.fullName;
            }
        }
        let updatedBy = null;
        let userUpdated = null;
        if (role.updatedBy && role.updatedBy.length > 0) {
            updatedBy = role.updatedBy.slice(-1)[0];
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
    res.render("admin/pages/roles/index", {
        pageTitle: "Danh sách nhóm quyền",
        activePage: "roles",
        roles,
    });
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        res.render("admin/pages/roles/create", {
            pageTitle: "Tạo mới danh mục sản phẩm",
            activePage: "roles",
        });
    }
    catch (error) {
        console.error("[roles.create] error:", error);
        (_b = (_a = req).flash) === null || _b === void 0 ? void 0 : _b.call(_a, "error", "Không thể tải tạo mới nhóm quyền!");
        res.redirect("/admin");
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { body } = req;
        body.createdBy = {
            account_id: res.locals.authUser._id || "",
        };
        const createdBy = body.createdBy;
        const payload = {
            title: body.title,
            description: body.description,
            createdBy,
        };
        const role = new role_model_1.default(payload);
        yield role.save();
        (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Tạo nhóm quyền mới thành công!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (err) {
        console.error("[createPost] error:", err);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Tạo nhóm quyền mới thất bại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.createPost = createPost;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const findData = { deleted: false, _id: req.params.id };
        const role = yield role_model_1.default.findOne(findData).lean();
        if (!role) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Nhóm quyền không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
            return;
        }
        res.render("admin/pages/roles/detail", {
            pageTitle: role.title || "Chi tiết nhóm quyền",
            role,
            activePage: "roles",
        });
    }
    catch (error) {
        console.error("[roles.detail] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Nhóm quyền không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.detail = detail;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const findData = { deleted: false, _id: req.params.id };
        const role = yield role_model_1.default.findOne(findData);
        if (!role) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Nhóm quyền không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
            return;
        }
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            activePage: "roles",
            role: role,
        });
    }
    catch (error) {
        console.error("[roles.edit] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Nhóm quyền không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const referer = req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/roles`;
    try {
        const update = {};
        if (req.body.title !== undefined)
            update.title = req.body.title;
        if (req.body.description !== undefined)
            update.description = req.body.description;
        const updatedBy = {
            account_id: res.locals.authUser._id,
            updatedAt: new Date(),
        };
        yield role_model_1.default.updateOne({ _id: id }, {
            $set: update,
            $push: {
                updatedBy: updatedBy,
            },
        });
        (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Cập nhật nhóm quyền thành công!");
    }
    catch (error) {
        console.error("[editPatch] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Cập nhật nhóm quyền thất bại!");
    }
    res.redirect(referer);
});
exports.editPatch = editPatch;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield role_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.authUser._id,
            deletedAt: new Date(),
        },
    });
    req.flash("success", "Xóa nhóm quyền thành công!");
    res.redirect(req.headers.referer);
});
exports.deleteItem = deleteItem;
const permissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = { deleted: false };
    const records = yield role_model_1.default.find(find).lean();
    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        activePage: "rolePermissions",
        records,
    });
});
exports.permissions = permissions;
const permissionsPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const referer = req.get("referer") || "/admin/roles/permissions";
    try {
        const raw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.permissions;
        if (!raw) {
            (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Thiếu dữ liệu phân quyền.");
            res.redirect(referer);
            return;
        }
        let payload;
        try {
            payload = JSON.parse(raw);
        }
        catch (_h) {
            (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Dữ liệu phân quyền không hợp lệ.");
            res.redirect(referer);
            return;
        }
        if (!Array.isArray(payload) || payload.length === 0) {
            (_d = req.flash) === null || _d === void 0 ? void 0 : _d.call(req, "error", "Không có thay đổi nào để cập nhật.");
            res.redirect(referer);
            return;
        }
        const updates = payload
            .filter((it) => typeof (it === null || it === void 0 ? void 0 : it.id) === "string" &&
            it.id.trim() !== "" &&
            it.permissions &&
            typeof it.permissions === "object")
            .map((it) => role_model_1.default.updateOne({ _id: it.id }, { $set: { permissions: it.permissions } }));
        if (updates.length === 0) {
            (_e = req.flash) === null || _e === void 0 ? void 0 : _e.call(req, "error", "Không có dữ liệu hợp lệ để cập nhật.");
            res.redirect(referer);
            return;
        }
        yield Promise.all(updates);
        (_f = req.flash) === null || _f === void 0 ? void 0 : _f.call(req, "success", "Phân quyền thành công!");
        res.redirect(referer);
    }
    catch (err) {
        console.error("[roles.permissionsPatch] error:", err);
        (_g = req.flash) === null || _g === void 0 ? void 0 : _g.call(req, "error", "Có lỗi khi lưu phân quyền.");
        res.redirect(referer);
    }
});
exports.permissionsPatch = permissionsPatch;
