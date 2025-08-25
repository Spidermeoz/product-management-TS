"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const home_route_1 = require("./home.route");
const product_route_1 = require("./product.route");
const clientRoutes = (app) => {
    app.use("/", home_route_1.homeRoutes);
    app.use("/products", product_route_1.productRoutes);
};
exports.default = clientRoutes;
