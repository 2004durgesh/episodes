import express, { Request, Response } from "express";
import { getProvider } from "../../providers";
import { PROVIDERS_LIST } from "@consumet/extensions/dist";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json([
    { routes: ["/episodes/:id", "/watch/:tmdbId", "/server/:tmdbId"] },
  ]);
});

router.get("/episodes/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { provider, type } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Missing required ID parameter",
      });
    }
    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Missing required type query parameter",
      });
    }

    if (provider) {
      const selectedProvider = PROVIDERS_LIST.MOVIES.find(
        (p) => p.name.toLowerCase() === provider.toLowerCase()
      );
      if (!selectedProvider) {
        return res.status(400).json({
          success: false,
          error: "Invalid provider specified",
        });
      }
    }
    const episodesData = await getProvider("tmdb").fetchEpisodes(
      id,
      type,
      provider
    );

    return res.status(200).json(episodesData);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

router.get("/watch/:tmdbId", async (req: any, res: any) => {
  try {
    const { tmdbId } = req.params;
    const { type, episodeNumber, seasonNumber, server, embed } = req.query;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        error: "Missing either tmdbId parameter",
      });
    }

    if (!type || !seasonNumber || !episodeNumber || !server) {
      return res.status(400).json({
        success: false,
        error:
          "Missing either type, seasonNumber, episodeNumber or server parameter",
      });
    }


    const streams = await getProvider("tmdb").fetchEpisodeSources(
      tmdbId,
      episodeNumber as string,
      seasonNumber as string,
      type as string,
      server as string,
      embed !== "false" && embed !== "0"
    );
    return res.status(200).json(streams);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

router.get("/server/:tmdbId", async (req: any, res: any) => {
  try {
    const { tmdbId } = req.params;
    const { type, episodeNumber, seasonNumber,embed } = req.query;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        error: "Missing either tmdbId parameter",
      });
    }

    if (!type || !seasonNumber || !episodeNumber) {
      return res.status(400).json({
        success: false,
        error: "Missing either type, seasonNumber or episodeNumber parameter",
      });
    }

    const server = await getProvider("tmdb").fetchEpisodeServers(
      tmdbId,
      episodeNumber as string,
      seasonNumber as string,
      type as string,
      embed !== "false" && embed !== "0"
    );
    return res.status(200).json(server);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
