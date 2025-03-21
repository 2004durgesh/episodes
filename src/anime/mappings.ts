import { IAnimeInfo, ITitle } from "@consumet/extensions";
import { AnimeInfoAnilist } from "../lib/Anilistfunctions";
import {
  getProvider,
  GogoAnimeProvider,
  AnimeKaiProvider,
  ZoroProvider,
  AnimePaheProvider,
} from "../providers/index";
import { Mappings, MetaProvider } from "../utils/types";
import axios from "axios";

interface MappingResponse {
  gogoanime: Mappings | null;
  zoro: Mappings | null;
  animekai: Mappings | null;
  animepahe: Mappings | null;
  id: string;
  malId?: number | string;
  title?: string;
}

export async function getMappings(
  id: string,
  metaProvider: MetaProvider
): Promise<MappingResponse | null> {
  try {
    let data;
    let gogores;
    let zorores;
    let animekaires;
    let animepaheres;
    if (metaProvider === "anilist") {
      data = await getAnilistInfo(id);
      gogores = await mapGogo(data?.title as ITitle);
      zorores = await mapZoro(data?.title as ITitle);
      animekaires = await mapAnimekai(data?.title as ITitle);
      animepaheres = await mapAnimepahe(data?.title as ITitle);
    } else {
      data = await getMalInfo(id);
      gogores = await mapGogo({
        romaji: data?.data?.title,
        english: data?.data.title_english,
      } as ITitle);
      zorores = await mapZoro({
        romaji: data?.data?.title,
        english: data?.data.title_english,
      } as ITitle);
      animekaires = await mapAnimekai({
        romaji: data?.data?.title,
        english: data?.data.title_english,
      } as ITitle);
      animepaheres = await mapAnimepahe({
        romaji: data?.data?.title,
        english: data?.data.title_english,
      } as ITitle);
    }
    if (!data) {
      return null;
    }

    return {
      gogoanime: gogores,
      zoro: zorores,
      animekai: animekaires,
      animepahe:animepaheres,
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

async function mapGogo(title: ITitle): Promise<Mappings | null> {
  return await new GogoAnimeProvider().getMapping(title);
}

async function mapZoro(title: ITitle): Promise<Mappings | null> {
  return await new ZoroProvider().getMapping(title);
}

async function mapAnimekai(title: ITitle): Promise<Mappings | null> {
  return await new AnimeKaiProvider().getMapping(title);
}

async function mapAnimepahe(title: ITitle): Promise<Mappings | null> {
  return await new AnimePaheProvider().getMapping(title);
}
