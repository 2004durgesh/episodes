import axios from "axios";
import { Source } from "../utils/types";
import { ISubtitle } from "@consumet/extensions";

export async function getRiveStream(
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

function generateSecretKey(id: number | string) {
  const keyArray = [
    "I",
    "3LZu",
    "M2V3",
    "4EXX",
    "s4",
    "yRy",
    "oqMz",
    "ysE",
    "RT",
    "iSI",
    "zlc",
    "H",
    "YNp",
    "5vR6",
    "h9S",
    "R",
    "jo",
    "F",
    "h2",
    "W8",
    "i",
    "sz09",
    "Xom",
    "gpU",
    "q",
    "6Qvg",
    "Cu",
    "5Zaz",
    "VK",
    "od",
    "FGY4",
    "eu",
    "D5Q",
    "smH",
    "11eq",
    "QrXs",
    "3",
    "L3",
    "YhlP",
    "c",
    "Z",
    "YT",
    "bnsy",
    "5",
    "fcL",
    "L22G",
    "r8",
    "J",
    "4",
    "gnK",
  ];

  // Handle undefined/null input
  if (typeof id === "undefined" || id === null) {
    return "rive";
  }

  // Convert to number and calculate array index
  const numericId = typeof id === "string" ? parseInt(id, 10) : Number(id);
  const index = numericId % keyArray.length;

  // Handle NaN cases (invalid number conversion)
  if (isNaN(index)) {
    return "rive";
  }

  return keyArray[index];
}
