import axios from "axios";
import { RiveEmbedSource, Source } from "../utils/types";
import { ISubtitle, MixDrop, VidCloud } from "@consumet/extensions";
import { generateSecretKey } from "../utils/utils";
import { Filemoon, StreamTape, StreamWish, VidMoly, Voe } from "@consumet/extensions/dist/extractors";

export async function getRiveEmbedStream(
  tmdbId: string,
  episode: string,
  season: string,
  type: string
): Promise<RiveEmbedSource[]> {
  const secret = generateSecretKey(Number(tmdbId));
  const baseUrl = "https://rivestream.net";
  // console.log(tmdbId, episode, season, type);
  const route = `/api/backendfetch?requestID=EmbedProviderServices&secretKey=rive&proxyMode=noProxy`;
  const serviceRoute =
    type === "series" || type === "tv"
      ? `/api/backendfetch?requestID=tvEmbedProvider&id=${tmdbId}&season=${season}&episode=${episode}&secretKey=${secret}&service=`
      : `/api/backendfetch?requestID=movieEmbedProvider&id=${tmdbId}&secretKey=${secret}&service=`;
  const url = baseUrl + route;
  const { data } = await axios.get(url);
  const sources:RiveEmbedSource[] =[]
  await Promise.all(
    data.data.map(async (service: string) => {
      // console.log(`Rive: ${service}`);
      const url = baseUrl + serviceRoute + service;
      try {
        const { data } = await axios.get(url);
        // console.log("Rive res: ", data.data.sources);
          sources.push(...data.data.sources);
        // return data.data.sources
      } catch (e) {
        console.log(e);
        throw new Error("Rive Error");
      }
    })
  );
  return sources
}

getRiveEmbedStream("108978", "1", "1", "series");
