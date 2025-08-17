import { Express } from "express";
import { dashboardRoutes } from "./dashboard.route";
import { systemConfig } from "../../config/config";
import { productRoutes } from "./product.route";
import { productCategoryRoutes } from "./product-category.route";
import { roleRoutes } from "./role.route";
import { accountRoutes } from "./account.route";

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use(`/${PATH_ADMIN}/dashboard`, dashboardRoutes);

  app.use(`/${PATH_ADMIN}/products`, productRoutes);

  app.use(`/${PATH_ADMIN}/products-category`, productCategoryRoutes);

  app.use(`/${PATH_ADMIN}/roles`, roleRoutes);

  app.use(`/${PATH_ADMIN}/accounts`, accountRoutes);
};

export default adminRoutes;
