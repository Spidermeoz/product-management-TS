import { Express } from "express";
import { homeRoutes } from "./home.route";
import { productRoutes } from "./product.route";

const clientRoutes = (app: Express): void => {
  app.use("/", homeRoutes);

  app.use("/products", productRoutes);
};

export default clientRoutes;