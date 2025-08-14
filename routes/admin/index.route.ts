import { Express } from "express";
import { dashboardRoutes } from "./dashboard.route";
import { systemConfig } from "../../config/config";
import { productRoutes } from "./product.route";

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use(`/${PATH_ADMIN}/dashboard`, dashboardRoutes);

  app.use(`/${PATH_ADMIN}/products`, productRoutes);
};

export default adminRoutes;
