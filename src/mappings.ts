import { IAnimeInfo, ITitle } from "@consumet/extensions";
import { AnimeInfoAnilist } from "./lib/Anilistfunctions";
import { AnimeKaiProvider, ZoroProvider, AnimePaheProvider } from "./providers";
import { MappingExtraData, Mappings, MetaProvider } from "./utils/types";
import axios from "axios";

interface MappingResponse {
  zoro: Mappings | null;
  animekai: Mappings | null;
  animepahe: Mappings | null;
  id: string;
  malId?: number | string;
  title?: string;
}

function getMalStartYear(aired: any): number | null {
  // 1️⃣ Try ISO date: aired.from
  if (aired?.from) {
    const year = new Date(aired.from).getFullYear();
    if (!isNaN(year)) return year;
  }

  // 2️⃣ Try parsing from string (e.g. "Oct 5, 2014")
  if (aired?.string) {
    const match = aired.string.match(/\b(19|20)\d{2}\b/);
    if (match) return Number(match[0]);
  }

  // 3️⃣ Fallback to prop.from.year
  if (aired?.prop?.from?.year) {
    return aired.prop.from.year;
  }

  return null;
}

export async function getMappings(
  id: string,
  metaProvider: MetaProvider
): Promise<MappingResponse | null> {
  try {
    let data;
    let zorores;
    let animekaires;
    let animepaheres;
    let extraData: MappingExtraData | undefined;
    if (metaProvider === "anilist") {
      data = await getAnilistInfo(id);
      extraData = {
        format: (data as any)?.format,
        startYear: (data as any)?.startDate?.year,
        mediaType: (data as any)?.type,
        episodes:
          typeof (data as any)?.episodes === "number"
            ? (data as any).episodes
            : undefined,
      };
      zorores = await mapZoro(data?.title as ITitle, extraData);
      animekaires = await mapAnimekai(data?.title as ITitle, extraData);
      animepaheres = await mapAnimepahe(data?.title as ITitle, extraData);
    } else {
      data = await getMalInfo(id);
      extraData = {
        format: (data as any)?.data?.type,
        startYear: getMalStartYear((data as any)?.data?.aired),
        episodes:
          typeof (data as any)?.data?.episodes === "number"
            ? (data as any).data.episodes
            : undefined,
      };
      zorores = await mapZoro(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        extraData
      );
      animekaires = await mapAnimekai(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        extraData
      );
      animepaheres = await mapAnimepahe(
        {
          romaji: data?.data?.title,
          english: data?.data.title_english,
        } as ITitle,
        extraData
      );
    }
    if (!data) {
      return null;
    }

    return {
      zoro: zorores,
      animekai: animekaires,
      animepahe: animepaheres,
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

async function mapZoro(
  title: ITitle,
  extraData?: MappingExtraData
): Promise<Mappings | null> {
  return await new ZoroProvider().getMapping(title, extraData);
}

async function mapAnimekai(
  title: ITitle,
  extraData?: MappingExtraData
): Promise<Mappings | null> {
  return await new AnimeKaiProvider().getMapping(title, extraData);
}

async function mapAnimepahe(
  title: ITitle,
  extraData?: MappingExtraData
): Promise<Mappings | null> {
  return await new AnimePaheProvider().getMapping(title, extraData);
}
