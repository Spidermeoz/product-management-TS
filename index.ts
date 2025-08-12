import express, { Express, Request, Response } from "express";

import dotenv from "dotenv";

import * as database from "./config/database";
import Product from "./models/product.model";

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

dotenv.config();

database.connect();

app.set("views", `./views`);
app.set("view engine", "pug");

app.get("/", async (req: Request, res: Response) => {
  res.render("client/pages/home/index");
});

app.get("/products", async (req: Request, res: Response) => {
  const products = await Product.find({
    deleted: false,
  });
  console.log(products);
  res.render("client/pages/products/index");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
