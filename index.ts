import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path"
import methodOverride from "method-override"
import flash from "connect-flash"
import session from "express-session"
import cookieParser from "cookie-parser";

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

// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

app.use(methodOverride('_method'));

app.use(cookieParser(process.env.COOKIE_SECRET || undefined));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Flash
app.use(session({
  cookie: { maxAge: 60000, secure: false }, // Tuỳ chọn (đặt true nếu dùng HTTPS)
  secret: 'your-secret-key', // Bắt buộc phải có
  resave: false,             // Chọn false để tránh lưu lại session không thay đổi
  saveUninitialized: false,  // Chọn false để tránh tạo session cho những request không cần
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
