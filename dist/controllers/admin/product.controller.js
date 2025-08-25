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
exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.deleteItem = exports.changeMulti = exports.changeStatus = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const filterStatus_helper_1 = require("../../helpers/filterStatus.helper");
const search_helper_1 = require("../../helpers/search.helper");
const pagination_helper_1 = require("../../helpers/pagination.helper");
const config_1 = require("../../config/config");
const createTree_helper_1 = require("../../helpers/createTree.helper");
const product_category_model_1 = __importDefault(require("../../models/product-category.model"));
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
    const { filterStatus, currentStatus } = (0, filterStatus_helper_1.makeFilterStatus)(req.query.status);
    const { keyword, criteria } = (0, search_helper_1.makeSearch)(req.query, {
        fields: ["title"],
    });
    const find = { deleted: false };
    if (currentStatus)
        find.status = currentStatus;
    if (criteria)
        Object.assign(find, criteria);
    const totalItems = yield product_model_1.default.countDocuments(find);
    const pagination = (0, pagination_helper_1.makePagination)({
        page: req.query.page,
        totalItems,
        limit: 6,
    });
    const ALLOWED_KEYS = ["position", "price", "title", "createdAt"];
    const isKey = (k) => typeof k === "string" && ALLOWED_KEYS.includes(k);
    const isDir = (d) => d === "asc" || d === "desc";
    const sort = Object.create(null);
    if (isKey(req.query.sortKey) && isDir(req.query.sortValue)) {
        sort[req.query.sortKey] = req.query.sortValue === "asc" ? 1 : -1;
    }
    else if (typeof req.query.sort === "string") {
        const [k, d] = req.query.sort.split("-", 2);
        if (isKey(k) && isDir(d)) {
            sort[k] = d === "asc" ? 1 : -1;
        }
    }
    if (!Object.keys(sort).length) {
        sort.position = -1;
    }
    if (!("createdAt" in sort)) {
        sort.createdAt = -1;
    }
    let query = product_model_1.default.find(find);
    if ("title" in sort) {
        query = query.collation({ locale: "vi", strength: 1 });
    }
    const productsData = yield product_model_1.default.find(find)
        .sort(sort)
        .limit(pagination.limitItems)
        .skip(pagination.skip)
        .lean();
    for (const product of productsData) {
        if (product.createdBy && product.createdBy.account_id) {
            const user = yield account_model_1.default.findOne({
                _id: product.createdBy.account_id,
            }).lean();
            if (user) {
                product["accountFullName"] = user.fullName;
            }
        }
        let updatedBy = null;
        let userUpdated = null;
        if (product.updatedBy && product.updatedBy.length > 0) {
            updatedBy = product.updatedBy.slice(-1)[0];
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
    const primaryKey = (Object.keys(sort).find((k) => k !== "createdAt") ||
        "position");
    const selectedSort = `${primaryKey}-${sort[primaryKey] === 1 ? "asc" : "desc"}`;
    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        activePage: "products",
        products: productsData,
        filterStatus,
        keyword,
        status: currentStatus,
        pagination,
    });
});
exports.index = index;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.params.status;
    const id = req.params.id;
    const updatedBy = {
        account_id: res.locals.authUser._id,
        updatedAt: new Date(),
    };
    yield product_model_1.default.updateOne({ _id: id }, {
        status: status,
        $push: {
            updatedBy: updatedBy,
        },
    });
    req.flash("success", "Thay đổi trạng thái sản phẩm thành công!");
    res.redirect(req.headers.referer);
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const referer = req.get("referer") || "/admin/products";
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
                yield product_model_1.default.updateMany({ _id: { $in: idList } }, {
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
                yield product_model_1.default.updateMany({ _id: { $in: idList } }, {
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
                yield product_model_1.default.updateMany({ _id: { $in: idList } }, {
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
                    yield product_model_1.default.updateOne({ _id: id }, {
                        position: parseInt(position),
                        $push: {
                            updatedBy: updatedBy,
                        },
                    });
                }
                req.flash("success", `${idList.length} sản phẩm được đổi vị trí thành công!`);
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
    yield product_model_1.default.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.authUser._id,
            deletedAt: new Date(),
        },
    });
    res.redirect(req.headers.referer);
});
exports.deleteItem = deleteItem;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = { deleted: false };
    const records = yield product_category_model_1.default.find(find).lean();
    const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
    res.render("admin/pages/products/create", {
        pageTitle: "Danh sách sản phẩm",
        activePage: "products",
        records: tree,
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { body } = req;
        const price = toInt(body.price, 0);
        const discountPercentage = toInt(body.discountPercentage, 0);
        const stock = toInt(body.stock, 0);
        let position;
        const rawPos = body.position;
        if (rawPos === undefined ||
            rawPos === null ||
            String(rawPos).trim() === "") {
            const count = yield product_model_1.default.countDocuments({ deleted: false });
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
        const payload = Object.assign(Object.assign({ title: body.title, product_category_id: body.product_category_id, description: body.description, price,
            discountPercentage,
            stock,
            position, status: (_a = body.status) !== null && _a !== void 0 ? _a : "active" }, (thumbnail ? { thumbnail } : {})), { createdBy });
        const product = new product_model_1.default(payload);
        yield product.save();
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "success", "Tạo sản phẩm thành công!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products`);
    }
    catch (err) {
        console.error("[createPost] error:", err);
        (_c = req.flash) === null || _c === void 0 ? void 0 : _c.call(req, "error", "Tạo sản phẩm thất bại!");
        res.redirect(`${config_1.systemConfig.prefixAdmin}/products`);
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
        const product = yield product_model_1.default.findOne(findData).lean();
        if (!product) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Sản phẩm không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/products`);
            return;
        }
        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            activePage: "products",
            product,
            records: tree,
        });
    }
    catch (error) {
        console.error("[products.edit] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Sản phẩm không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products`);
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
        if (req.body.product_category_id !== undefined) {
            update.product_category_id = req.body.product_category_id;
        }
        if (req.body.description !== undefined)
            update.description = req.body.description;
        const price = toOptInt(req.body.price);
        if (price !== undefined)
            update.price = price;
        const discount = toOptInt(req.body.discountPercentage);
        if (discount !== undefined)
            update.discountPercentage = discount;
        const stock = toOptInt(req.body.stock);
        if (stock !== undefined)
            update.stock = stock;
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
        yield product_model_1.default.updateOne({ _id: id }, {
            $set: update,
            $push: {
                updatedBy: updatedBy,
            },
        });
        (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "success", "Cập nhật sản phẩm thành công!");
    }
    catch (error) {
        console.error("[editPatch] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Cập nhật sản phẩm thất bại!");
    }
    res.redirect(referer);
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const find = { deleted: false };
        const records = yield product_category_model_1.default.find(find).lean();
        const tree = (0, createTree_helper_1.buildCategoryTree)(records, { sortBy: "position", dir: 1 });
        const findData = { deleted: false, _id: req.params.id };
        const product = yield product_model_1.default.findOne(findData).lean();
        if (!product) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Sản phẩm không tồn tại!");
            res.redirect(`/${config_1.systemConfig.prefixAdmin}/products`);
            return;
        }
        res.render("admin/pages/products/detail", {
            pageTitle: product.title || "Chi tiết sản phẩm",
            product,
            records: tree,
            activePage: "products",
        });
    }
    catch (error) {
        console.error("[products.detail] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Sản phẩm không tồn tại!");
        res.redirect(`/${config_1.systemConfig.prefixAdmin}/products`);
    }
});
exports.detail = detail;
