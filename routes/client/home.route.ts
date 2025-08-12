import { Request, Response, Router } from "express";
const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  res.render("client/pages/home/index");
});

export const homeRoutes: Router = router;
