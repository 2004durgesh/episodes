import { IAnimeInfo, ITitle } from "@consumet/extensions";
import { AnimeInfoAnilist } from "../lib/Anilistfunctions";
import { getProvider } from "../providers/index";
import { Mappings, MetaProvider } from "../utils/types";
import axios from "axios";

interface MappingResponse {
  gogoanime: Mappings | null;
  zoro: Mappings | null;
  animekai: Mappings | null;
  id: string;
  malId?: number | string;
  title?: string;
}

export async function getMappings(
  id: string,
  metaProvider: MetaProvider,
  provider: string
): Promise<MappingResponse | null> {
  try {
    let data;
    let gogores;
    let zorores;
    let animekaires;
    if (metaProvider === "anilist") {
      data = await getAnilistInfo(id);
      gogores = await mapGogo(data?.title as ITitle, provider);
      zorores = await mapZoro(data?.title as ITitle, provider);
      animekaires = await mapAnimekai(data?.title as ITitle, provider);
    } else {
      data = await getMalInfo(id);
      gogores = await mapGogo(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        provider
      );
      zorores = await mapZoro(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        provider
      );
      animekaires = await mapAnimekai(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        provider
      );
    }
    if (!data) {
      return null;
    }

    return {
      gogoanime: gogores,
      zoro: zorores,
      animekai: animekaires,
      id: id,
      malId: data?.idMal,
      title: typeof data?.title === "object" ? data.title.romaji : data?.title,
    };
  } catch (error) {
    console.error("Error getting mappings:", error);
    return null;
  }
}

async function getAnilistInfo(id: string): Promise<IAnimeInfo | null> {
  try {
    const data = await AnimeInfoAnilist(id);
    return data ?? null;
  } catch (error) {
    console.error("Error getting anime info:", error);
    return null;
  }
}

async function getMalInfo(id: string): Promise<IAnimeInfo | null> {
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
    return data ?? null;
  } catch (error) {
    console.error("Error getting anime info:", error);
    return null;
  }
}

async function mapGogo(
  title: ITitle,
  provider: string
): Promise<Mappings | null> {
  return await getProvider(provider).getMapping(title);
}

async function mapZoro(
  title: ITitle,
  provider: string
): Promise<Mappings | null> {
  return await getProvider(provider).getMapping(title);
}

async function mapAnimekai(
  title: ITitle,
  provider: string
): Promise<Mappings | null> {
  return await getProvider(provider).getMapping(title);
}
