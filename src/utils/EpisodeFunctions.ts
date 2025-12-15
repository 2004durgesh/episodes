import { MetaResponse, UnifiedEpisode } from "../episode";

export interface EpisodeSchema {
  number: number;
  episode?: number;
  img?: string;
  image?: string;
  airDate?: string;
  airDateUtc?: string;
  title?:
    | string
    | {
        en?: string;
        "x-jat"?: string;
        [key: string]: string | undefined;
      };
  description?: string;
  overview?: string;
  summary?: string;
  mappings?: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface ProvidersMapResult {
  suboptions: string[];
  dubLength: number;
}

export async function CombineEpisodeMeta(
  episodeData: UnifiedEpisode[],
  imageData: EpisodeSchema[]
): Promise<UnifiedEpisode[]> {
  const episodeImages: { [key: number]: EpisodeSchema } = {};

  imageData.forEach((image) => {
    episodeImages[image.number || image.episode || 0] = image;
  });

  for (const episode of episodeData) {
    const episodeNum = episode.number;
    if (episodeImages[episodeNum]) {
      const image =
        episodeImages[episodeNum].img || episodeImages[episodeNum].image;
      const airDate =
        episodeImages[episodeNum].airDate ||
        episodeImages[episodeNum].airDateUtc;
      let title: string;

      if (typeof episodeImages[episodeNum]?.title === "object") {
        const titleObj = episodeImages[episodeNum].title as {
          en?: string;
          "x-jat"?: string;
        };
        const en = titleObj?.en;
        const xJat = titleObj?.["x-jat"];
        title = en || xJat || `EPISODE ${episodeNum}`;
      } else {
        title = (episodeImages[episodeNum]?.title as string) || "";
      }

      const description =
        episodeImages[episodeNum].description ||
        episodeImages[episodeNum].overview ||
        episodeImages[episodeNum].summary;

      Object.assign(episode, { image, title, description, airDate });
    }
  }
  return episodeData;
}

export function ProvidersMap(
  episodeData: UnifiedEpisode[],
  defaultProvider: string | null = null,
  setDefaultProvider: (providerId: string) => void = () => {}
): ProvidersMapResult {
  const dProvider = episodeData.filter((i) => i?.consumet === true);
  let suboptions: string[] = [];
  let dubLength = 0;

  if (dProvider?.length > 0) {
    const episodes = dProvider[0].episodes;
    if (episodes) {
      if (!Array.isArray(episodes)) {
        suboptions = Object.keys(episodes);
        const dubEpisodes = episodes.dub || [];
        dubLength = Math.floor(
          Math.max(...dubEpisodes.map((e: UnifiedEpisode) => e.number), 0)
        );
      }
    }
  }

  if (!defaultProvider) {
    setDefaultProvider(
      dProvider[0]?.providerId || episodeData[0]?.providerId || ""
    );
  }

  if (
    suboptions.length === 0 ||
    (suboptions.length === 1 && suboptions[0] === "dub")
  ) {
    suboptions.push("sub");
  }

  return { suboptions, dubLength };
}
