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
exports.detail = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({
        status: "active",
        deleted: false,
    }).sort({ position: "desc" });
    const newProducts = products.map((item) => {
        item["newPrice"] = item.price - (item.price * item.discountPercentage) / 100;
        item["newPrice"] = item["newPrice"].toFixed(2);
        return item;
    });
    res.render("client/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: newProducts
    });
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const product = yield product_model_1.default.findOne({
            deleted: false,
            slug: req.params.slug,
            status: "active",
        }).lean();
        if (!product) {
            (_a = req.flash) === null || _a === void 0 ? void 0 : _a.call(req, "error", "Sản phẩm không tồn tại!");
            res.redirect("/products");
            return;
        }
        res.render("client/pages/products/detail", {
            pageTitle: product.title || "Chi tiết sản phẩm",
            product,
        });
    }
    catch (error) {
        console.error("[client.products.detail] error:", error);
        (_b = req.flash) === null || _b === void 0 ? void 0 : _b.call(req, "error", "Sản phẩm không tồn tại!");
        res.redirect("/products");
    }
});
exports.detail = detail;
