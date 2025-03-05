import { getProvider } from "../providers/index";
import { CombineEpisodeMeta, EpisodeSchema } from "../utils/EpisodeFunctions";
import { MetaProvider } from "../utils/types";
import { getMappings } from "./mappings";
import { IAnimeEpisode } from "@consumet/extensions/dist";

interface EpisodeResponse {
  sub: IAnimeEpisode[];
  dub: IAnimeEpisode[];
}

export interface UnifiedEpisode extends EpisodeSchema {
  dubId?: string;
  isDub: boolean;
  dubUrl?: string;
}
interface MetaMappings {
  [key: string]: any;
}
export interface MetaResponse {
  episodes: IAnimeEpisode[];
  mappings?: MetaMappings;
}

export async function fetchEpisodeMeta(
  id: string,
  metaProvider?: MetaProvider
): Promise<MetaResponse> {
  try {
    let url;
    if (metaProvider === "anilist") {
      url = `https://api.ani.zip/mappings?anilist_id=${id}`;
    } else if (metaProvider === "mal") {
      url = `https://api.ani.zip/mappings?mal_id=${id}`;
    } else {
      url = `https://api.ani.zip/mappings?${metaProvider}=${id}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    const episodesArray = Object.values(
      data?.episodes || {}
    ) as IAnimeEpisode[];
    return { episodes: episodesArray || [], mappings: data?.mappings };
  } catch (error) {
    console.error("Error fetching and processing meta:", error);
    return { episodes: [] };
  }
}

export const fetchEpisodesData = async (
  id: string,
  metaProvider: MetaProvider,
  preferredProvider: string | null = null
): Promise<UnifiedEpisode[]> => {
  // Run mappings and meta fetch in parallel
  const [mappings, episodeMeta] = await Promise.all([
    getMappings(id, metaProvider),
    fetchEpisodeMeta(id, metaProvider),
  ]);

  if (!mappings) return [];

  // Process all providers in parallel
  const providerPromises = Object.entries(mappings)
    .filter(
      ([providerName]) =>
        !preferredProvider || providerName === preferredProvider
    )
    .map(async ([providerName, providerMappings]) => {
      const provider = getProvider(providerName);
      if (
        !provider ||
        !providerMappings ||
        Object.keys(providerMappings).length === 0
      ) {
        return null;
      }

      const episodes: EpisodeResponse = { sub: [], dub: [] };

      // Fetch sub and dub episodes in parallel
      await Promise.all([
        (async () => {
          if (
            providerMappings.uncensored ||
            providerMappings.sub ||
            providerMappings.tv
          ) {
            episodes.sub = await provider.fetchEpisodes(
              providerMappings.uncensored ||
                providerMappings.sub ||
                providerMappings.tv
            );
          }
        })(),
        (async () => {
          if (providerMappings.dub) {
            episodes.dub = await provider.fetchEpisodes(providerMappings.dub);
          }
          if (
            preferredProvider === "zoro" ||
            preferredProvider === "animekai"
          ) {
            episodes.dub = await provider.fetchEpisodes(providerMappings.sub);
          }
        })(),
      ]);
      const unifiedEpisodes = unifyEpisodes(episodes.sub, episodes.dub, id);
      if (episodes.sub.length > 0 || episodes.dub.length > 0) {
        return unifiedEpisodes;
      }
      return null;
    });

  const results = (await Promise.all(providerPromises)).filter(
    (result) => result !== null
  );
  // console.log("Results:", results[0]);

  if (episodeMeta?.episodes.length > 0 && results[0]) {
    return await CombineEpisodeMeta(results[0], episodeMeta.episodes);
  }
  return results[0] || [];
};

// export const getEpisodes = async (id: string): Promise<UnifiedEpisode[]> => {
//   try {
//     const data = await fetchEpisodesData(id);
//     return Array.isArray(data) ? data : [];
//   } catch (error) {
//     console.error("Error fetching episodes:", error);
//     return [];
//   }
// };

function unifyEpisodes(
  sub: EpisodeSchema[],
  dub: EpisodeSchema[],
  anilistId: string
): UnifiedEpisode[] {
  const unifiedEpisodes: UnifiedEpisode[] = [];

  const dubMap = new Map(dub.map((d) => [d.number, d]));
  sub.forEach((subEpisode) => {
    const matchingDub = dubMap.get(subEpisode.number);

    unifiedEpisodes.push({
      id: subEpisode.id,
      dubId: matchingDub?.id,
      uniqueId: `${anilistId}$ep=${subEpisode.number}`,
      isDub: matchingDub?.isDubbed,
      number: subEpisode.number,
      url: subEpisode.url,
      dubUrl: matchingDub?.url,
      image: subEpisode.image || matchingDub?.image,
      title: matchingDub?.title || subEpisode.title,
      description: subEpisode.description || matchingDub?.description,
      airDate: subEpisode.airDate || matchingDub?.airDate,
    });

    // Remove the matched dub to avoid duplicates in the next loop
    if (matchingDub) {
      dubMap.delete(subEpisode.number);
    }
  });

  // Add any remaining dub episodes that don't match sub episodes
  dubMap.forEach((dubEpisode) => {
    unifiedEpisodes.push({
      id: dubEpisode.id,
      dubId: undefined,
      isDub: true,
      number: dubEpisode.number,
      url: dubEpisode.url,
      image: dubEpisode.image,
      title: dubEpisode.title,
      description: dubEpisode.description,
      airDate: dubEpisode.airDate,
    });
  });

  return unifiedEpisodes;
}
