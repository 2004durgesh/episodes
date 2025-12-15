import express, { Request, Response } from "express";
import animeRouter from "./anime";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json([{ routes: ["/anime/"] }]);
});
router.use("/anime", animeRouter);

export default router;
