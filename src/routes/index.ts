import express, { Request, Response } from "express";
import animeRouter from "./anime";
import moviesRouter from "./movies/tmdb";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json([{ routes: ["/anime/", "/movies/"] }]);
});
router.use("/anime", animeRouter);
router.use("/movies/tmdb", moviesRouter);

export default router;
