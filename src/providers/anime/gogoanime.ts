import { ANIME, IAnimeEpisode, ITitle } from "@consumet/extensions";
import { Provider } from "../base";
import { findSimilarTitles } from "../../lib/stringSimilarity";
import {
  Mappings,
} from "../../utils/types";

export class GogoAnimeProvider extends Provider {
  constructor() {
    super("gogoanime");
  }
  client = new ANIME.Gogoanime(process.env.GOGOANIME_URL);
  async fetchEpisodes(id: string): Promise<IAnimeEpisode[]> {
    try {
      const data = await this.client.fetchAnimeInfo(id);
      return data?.episodes || [];
    } catch (error) {
      console.error(
        `Error fetching ${this.name}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      return [];
    }
  }

  async getMapping(title: ITitle): Promise<Mappings> {
    try {
      // Parallel search execution
      const [engResults, romResults] = await Promise.all([
        this.client
          .search(title?.english || title?.userPreferred || "")
          .then((res) => res?.results || [])
          .catch(() => []),
        this.client
          .search(title?.romaji || "")
          .then((res) => res?.results || [])
          .catch(() => []),
      ]);

      // Combine and deduplicate results efficiently
      const uniqueResults = [
        ...new Map(
          [...engResults, ...romResults].map((item) => [item.id, item])
        ).values(),
      ];

      const mapped = findSimilarTitles(
        title?.romaji || title?.english || title?.userPreferred || "",
        uniqueResults
      );

      // Initialize mappings object with all possible keys
      const mappings: Mappings = {
        sub: undefined,
        dub: undefined,
        uncensored: undefined,
      };

      // Single pass through mapped results
      for (const obj of mapped) {
        const match = obj.title.replace(/\(TV\)/g, "").match(/\(([^)0-9]+)\)/);

        if (match) {
          const key = match[1].toLowerCase();
          if ((key === "uncensored" || key === "dub") && !mappings[key]) {
            mappings[key] = obj.id;
          }
        } else if (!mappings.sub) {
          mappings.sub = obj.id;
        }

        // Break early if all mappings are filled
        if (mappings.sub && mappings.dub && mappings.uncensored) break;
      }

      return mappings;
    } catch (error) {
      console.error("Error in getMapping:", error);
      return { sub: undefined, dub: undefined, uncensored: undefined };
    }
  }
}
