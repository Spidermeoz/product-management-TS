"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_updater_1 = __importDefault(require("mongoose-slug-updater"));
mongoose_1.default.plugin(mongoose_slug_updater_1.default);
const productSchema = new mongoose_1.default.Schema({
    title: String,
    product_category_id: {
        type: String,
        default: "",
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    position: Number,
    slug: {
        type: String,
        slug: "title",
        unique: true,
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        account_id: String,
        deletedAt: Date,
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date,
        },
    ],
});
const Product = mongoose_1.default.model("Product", productSchema, "products");
exports.default = Product;
