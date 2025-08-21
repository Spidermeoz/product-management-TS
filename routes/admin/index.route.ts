import { Express } from "express";
import { dashboardRoutes } from "./dashboard.route";
import { systemConfig } from "../../config/config";
import { productRoutes } from "./product.route";
import { productCategoryRoutes } from "./product-category.route";
import { roleRoutes } from "./role.route";
import { accountRoutes } from "./account.route";
import { authRoutes } from "./auth.route";

import * as authMiddleware from "../../middlewares/admin/auth.middleware"
import { myAccountRoutes } from "./my-account.route";

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use(`/${PATH_ADMIN}/dashboard`, authMiddleware.requireAuth, dashboardRoutes);

  app.use(`/${PATH_ADMIN}/products`, authMiddleware.requireAuth, productRoutes);

  app.use(`/${PATH_ADMIN}/products-category`, authMiddleware.requireAuth, productCategoryRoutes);

  app.use(`/${PATH_ADMIN}/roles`, authMiddleware.requireAuth, roleRoutes);

  app.use(`/${PATH_ADMIN}/accounts`, authMiddleware.requireAuth, accountRoutes);

  app.use(`/${PATH_ADMIN}/auth`, authRoutes);

  app.use(`/${PATH_ADMIN}/my-account`, authMiddleware.requireAuth, myAccountRoutes);
};

export default adminRoutes;
