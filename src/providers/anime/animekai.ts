import { ANIME, IAnimeEpisode, ITitle } from "@consumet/extensions";
import { Provider } from "../base";
import { findSimilarTitles } from "../../lib/stringSimilarity";
import { Mappings } from "../../utils/types";
import axios from "axios";

export class AnimeKaiProvider extends Provider {
  constructor() {
    super("animekai");
  }
  client = new ANIME.AnimeKai();
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
    const { data } = await axios.get("https://animekai.to");
    console.log(data);
    try {
      // Run searches in parallel
      const searchTerm =
        title?.romaji || title?.english || title?.userPreferred || "";
      const searchResults = await this.client.search(searchTerm);

      if (!searchResults?.results) {
        return {};
      }

      // Run similar title searches in parallel
      const [mappedEng, mappedRom] = await Promise.all([
        Promise.resolve(
          findSimilarTitles(title?.english || "", searchResults.results)
        ),
        Promise.resolve(
          findSimilarTitles(title?.romaji || "", searchResults.results)
        ),
      ]);

      // Use Set for efficient deduplication
      const uniqueResults = Array.from(
        new Set(
          [...mappedEng, ...mappedRom].map((item) => JSON.stringify(item))
        )
      ).map((str) => JSON.parse(str));

      // Sort by similarity score
      uniqueResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      // Single pass mapping
      const mappings: Mappings = {};
      for (const obj of uniqueResults) {
        const match = obj.title.replace(/\(TV\)/g, "").match(/\(([^)0-9]+)\)/);
        const key = match ? match[1].replace(/\s+/g, "-").toLowerCase() : "sub";

        if (!mappings[key]) {
          mappings[key] = obj.id;
        }

        // Early return if we have both sub and dub
        if (mappings.sub && mappings.dub) break;
      }

      return mappings;
    } catch (error) {
      console.error(
        "Error in getMapping from animekai :",
        error,
        error instanceof Error ? error.message : "Unknown error"
      );
      return {};
    }
  }
}
