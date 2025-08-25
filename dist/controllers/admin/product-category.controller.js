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
exports.detail = exports.deleteItem = exports.changeMulti = exports.changeStatus = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const product_category_model_1 = __importDefault(require("../../models/product-category.model"));
const config_1 = require("../../config/config");
const createTree_helper_1 = require("../../helpers/createTree.helper");
const account_model_1 = __importDefault(require("../../models/account.model"));
const toInt = (v, def = 0) => {
    if (typeof v === "number" && Number.isFinite(v))
        return v;
    if (typeof v === "string") {
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : def;
    }
    return def;
};
const toOptInt = (v) => {
    if (v === undefined || v === null)
        return undefined;
    const s = typeof v === "string" ? v.trim() : String(v);
    if (s === "")
        return undefined;
    const n = typeof v === "number" ? v : parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
};
const isChangeType = (t) => t === "active" ||
    t === "inactive" ||
    t === "delete-all" ||
    t === "change-position";
const toIdList = (ids) => {
    if (!ids)
        return [];
    const raw = Array.isArray(ids) ? ids : ids.split(",");
    return raw.map((s) => String(s).trim()).filter(Boolean);
};
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false };
        const records = yield product_category_model_1.default.find(find).lean();
        for (const productCategory of records) {
            if (productCategory.createdBy && productCategory.createdBy.account_id) {
                const user = yield account_model_1.default.findOne({
                    _id: productCategory.createdBy.account_id,
                }).lean();
                if (user) {
                    productCategory["accountFullName"] = user.fullName;
                }
            }
            let updatedBy = null;
            let userUpdated = null;
            if (productCategory.updatedBy && productCategory.updatedBy.length > 0) {
                updatedBy = productCategory.updatedBy.slice(-1)[0];
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
        const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
        res.render("admin/pages/products-category/index", {
            pageTitle: "Danh mục sản phẩm",
            activePage: "products-category",
            records: tree,
        });
    }
    catch (error) {
        console.error("[products-category.index] error:", error);
        (_b = (_a = req).flash) === null || _b === void 0 ? void 0 : _b.call(_a, "error", "Không thể tải danh mục sản phẩm!");
        res.redirect("/admin");
    }
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false };
        const records = yield product_category_model_1.default.find(find).lean();
        const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
        res.render("admin/pages/products-category/create", {
            pageTitle: "Tạo mới danh mục sản phẩm",
            activePage: "products-category",
            records: tree,
        });
    }
    catch (error) {
        console.error("[products-category.create] error:", error);
        (_b = (_a = req).flash) === null || _b === void 0 ? void 0 : _b.call(_a, "error", "Không thể tải tạo mới danh mục sản phẩm!");
        res.redirect("/admin");
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { body } = req;
        let position;
        const rawPos = body.position;
        if (rawPos === undefined ||
            rawPos === null ||
            String(rawPos).trim() === "") {
            const count = yield product_category_model_1.default.countDocuments({ deleted: false });
            position = count + 1;
        }
        else {
            position = toInt(rawPos, 1);
        }
        const thumbnail = typeof req.body.thumbnail === "string" && req.body.thumbnail.trim()
            ? req.body.thumbnail.trim()
            : undefined;
        body.createdBy = {
            account_id: res.locals.authUser._id || "",
        };
        const createdBy = body.createdBy;
        const payload = Object.assign(Object.assign({ title: body.title, description: body.description, position, parent_id: body.parent_id, status: (_a = body.status) !== null && _a !== void 0 ? _a : "active" }, (thumbnail ? { thumbnail } : {})), { createdBy });
        const productCategory = new product_category_model_1.default(payload);
        yield productCategory.save();
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "success", "Tạo danh mục mới thành công!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products-category`);
    }
    catch (err) {
        console.error("[createPost] error:", err);
        (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Tạo danh mục mới thất bại!");
        res.redirect(`${config_1.systemConfig.prefixAdmin}/products-category`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false };
        const records = yield product_category_model_1.default.find(find).lean();
        const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
        const findData = { deleted: false, _id: req.params.id };
        const data = yield product_category_model_1.default.findOne(findData);
        if (!data) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Danh mục sản phẩm không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/products-category`);
            return;
        }
        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            activePage: "products-category",
            data: data,
            records: tree,
        });
    }
    catch (error) {
        console.error("[products.edit] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Danh mục sản phẩm không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products-category`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const referer = req.get("referer") || `/${config_1.systemConfig.prefixAdmin}/products`;
    try {
        const update = {};
        if (req.body.title !== undefined)
            update.title = req.body.title;
        if (req.body.parent_id !== undefined) {
            update.parent_id = req.body.parent_id;
        }
        if (req.body.description !== undefined)
            update.description = req.body.description;
        const position = toOptInt(req.body.position);
        if (position !== undefined)
            update.position = position;
        if (req.body.status === "active" || req.body.status === "inactive") {
            update.status = req.body.status;
        }
        const cloudThumb = typeof req.body.thumbnail === "string" && req.body.thumbnail.trim()
            ? req.body.thumbnail.trim()
            : "";
        if (cloudThumb) {
            update.thumbnail = cloudThumb;
        }
        const updatedBy = {
            account_id: res.locals.authUser._id,
            updatedAt: new Date(),
        };
        yield product_category_model_1.default.updateOne({ _id: id }, {
            $set: update,
            $push: {
                updatedBy: updatedBy,
            },
        });
        (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Cập nhật danh mục sản phẩm thành công!");
    }
    catch (error) {
        console.error("[editPatch] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Cập nhật danh mục sản phẩm thất bại!");
    }
    res.redirect(referer);
});
exports.editPatch = editPatch;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const id = req.params.id;
    const updatedBy = {
        account_id: res.locals.authUser._id,
        updatedAt: new Date(),
    };
    yield product_category_model_1.default.updateOne({ _id: id }, {
        status: status,
        $push: {
            updatedBy: updatedBy,
        },
    });
    req.flash("success", "Thay đổi trạng thái danh mục sản phẩm thành công!");
    res.redirect(req.headers.referer);
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const referer = req.get("referer") || "/admin/products-category";
    try {
        const { type } = req.body;
        const idList = toIdList(req.body.ids);
        const updatedBy = {
            account_id: res.locals.authUser._id,
            updatedAt: new Date(),
        };
        if (!isChangeType(type) || idList.length === 0) {
            return res.redirect(referer);
        }
        switch (type) {
            case "active":
                yield product_category_model_1.default.updateMany({ _id: { $in: idList } }, {
                    $set: {
                        status: "active",
                        $push: {
                            updatedBy: updatedBy,
                        },
                    },
                });
                req.flash("success", `${idList.length} sản phẩm được cập nhật trạng thái thành công!`);
                break;
            case "inactive":
                yield product_category_model_1.default.updateMany({ _id: { $in: idList } }, {
                    $set: {
                        status: "inactive",
                        $push: {
                            updatedBy: updatedBy,
                        },
                    },
                });
                req.flash("success", `${idList.length} sản phẩm được cập nhật trạng thái thành công!`);
                break;
            case "delete-all":
                yield product_category_model_1.default.updateMany({ _id: { $in: idList } }, {
                    $set: {
                        deleted: true,
                        deletedBy: {
                            account_id: res.locals.authUser._id,
                            deletedAt: new Date(),
                        },
                    },
                });
                req.flash("success", `${idList.length} sản phẩm được xóa thành công!`);
                break;
            case "change-position":
                for (const item of idList) {
                    const [id, position] = item.split("-");
                    yield product_category_model_1.default.updateOne({ _id: id }, {
                        position: parseInt(position),
                        $push: {
                            updatedBy: updatedBy,
                        },
                    });
                }
                req.flash("success", `${idList.length} danh mục sản phẩm được đổi vị trí thành công!`);
                break;
        }
        return res.redirect(referer);
    }
    catch (err) {
        console.error("[changeMulti] error:", err);
        return res.redirect(referer);
    }
});
exports.changeMulti = changeMulti;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield product_category_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.authUser._id,
            deletedAt: new Date(),
        },
    });
    req.flash("success", "Xóa danh mục sản phẩm thành công!");
    res.redirect(req.headers.referer);
});
exports.deleteItem = deleteItem;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false };
        const records = yield product_category_model_1.default.find(find).lean();
        const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
        const findData = { deleted: false, _id: req.params.id };
        const productCategory = yield product_category_model_1.default.findOne(findData).lean();
        if (!productCategory) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Danh mục không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/products-category`);
            return;
        }
        res.render("admin/pages/products-category/detail", {
            pageTitle: productCategory.title || "Chi tiết danh mục sản phẩm",
            productCategory,
            records: tree,
            activePage: "products-category",
        });
    }
    catch (error) {
        console.error("[products-category.detail] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Danh mục không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products-category`);
    }
});
exports.detail = detail;
