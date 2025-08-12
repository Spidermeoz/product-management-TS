import express, { Express, Request, Response } from "express";  

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.set("views", `./views`);
app.set("view engine", "pug");

app.get("/", (req: Request, res: Response) => {
  res.render("client/pages/home/index");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});