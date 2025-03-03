import express, { Request, Response } from "express";
import { getProvider } from "../providers";
import { fetchEpisodeMeta, fetchEpisodesData } from "../anime/episode";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json([{ routes: ["/episodes/:id","/mappings/:idType/:id"] }]);
});

router.get("/mappings/:idType/:id", async (req: any, res: any) => {
  try {
    const { idType, id } = req.params;

    if (!idType || !id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: idType and id"
      });
    }
    
    const supportedTypes = [
      "anilist_id", "mal_id", "kitsu_id", "animeplanet_id",
      "anisearch_id", "anidb_id", "notifymoe_id", "livechart_id", 
      "thetvdb_id", "imdb_id", "themoviedb_id"
    ];
    
    if (!supportedTypes.includes(idType)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported ID type: ${idType}, supported types: ${supportedTypes.join(", ")}`
      });
    }

    const mappings = await fetchEpisodeMeta(id);
    res.status(200).json(mappings.mappings);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

router.get("/episodes/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { provider } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Missing required ID parameter",
      });
    }

    if (provider) {
      const selectedProvider = getProvider(provider as string);
      if (!selectedProvider) {
        return res.status(400).json({
          success: false,
          error: "Invalid provider specified",
        });
      }
    }
    const episodesData = await fetchEpisodesData(
      id,
      (provider as string) || "zoro"
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

export default router;
