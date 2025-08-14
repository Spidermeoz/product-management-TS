import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import methodOverride from "method-override"
import flash from "connect-flash"
import session from "express-session"

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

app.use(methodOverride('_method'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Flash
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());

// Đưa flash vào res.locals để Pug dùng
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash("success")[0], // lấy phần tử đầu tiên
    error: req.flash("error")[0],
    info: req.flash("info")[0],
  };
  next();
});

// App Local Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

clientRoutes(app);

adminRoutes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
