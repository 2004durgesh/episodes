import axios from "axios";
import { Source } from "../utils/types";
import { ISubtitle } from "@consumet/extensions";
import { generateSecretKey } from "../utils/utils";

export async function getRiveNonEmbedStream(
  tmdbId: string,
  episode: string,
  season: string,
  type: string,
  Sources: Source[]
) {
  const secret = generateSecretKey(Number(tmdbId));
  const servers = [
    "hydrax",
    "fastx",
    "filmecho",
    "nova",
    "guru",
    "g1",
    "g2",
    "ee3",
    "ghost",
    "putafilme",
    "asiacloud",
    "kage",
  ];
  const baseUrl = "https://rivestream.net";
  // console.log(tmdbId, episode, season, type);
  const route =
    type === "series" || type === "tv"
      ? `/api/backendfetch?requestID=tvVideoProvider&id=${tmdbId}&season=${season}&episode=${episode}&secretKey=${secret}&service=`
      : `/api/backendfetch?requestID=movieVideoProvider&id=${tmdbId}&secretKey=${secret}&service=`;
  const url = baseUrl + route;
  await Promise.all(
    servers.map(async (server) => {
      // console.log("Rive: " + url + server);
      try {
        const res = await axios.get(url + server, { timeout: 4000 });
        const subtitles :ISubtitle[]= [];
        if (res.data?.data?.captions) {
          res.data?.data?.captions.forEach((sub: any) => {
            subtitles.push({
              lang: sub?.label?.replace(" - Ghost","") || "Und",
              url: sub?.file,
            });
          });
        }
        // console.log("Rive res: ", subtitles[0]);
        res.data?.data?.sources.forEach((source: any) => {
          Sources.push({
            server: `${source?.source}-${source?.quality.split(" ").join("-")}`,
            sources: [
              { url: source?.url, isM3U8: source?.url?.endsWith(".m3u8") },
            ],
            subtitles: subtitles,
          });
        });
        // console.log("Rive Stream: ", Sources);
      } catch (e) {
        // console.log(e);
        throw new Error("Rive Error");
      }
    })
  );
}


