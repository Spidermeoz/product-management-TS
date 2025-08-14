import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";

import { systemConfig } from "./config/config";

import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

dotenv.config();

database.connect();

app.use(express.static("public"));

app.set("views", `./views`);
app.set("view engine", "pug");

// App Local Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

clientRoutes(app);

adminRoutes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
