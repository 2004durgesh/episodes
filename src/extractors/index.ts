import { Source } from "../utils/types";
import { multiExtractor } from "./multi";
import { stableExtractor } from "./stable";
import { getRiveNonEmbedStream } from "./rive-nonembed";
import axios from "axios";

const autoembed = "YXV0b2VtYmVkLmNj";

// Helper for safely executing provider functions
const safeProviderFetch = async (providerName: string, fetchFn: () => Promise<Source[]>): Promise<Source[]> => {
  try {
    return await fetchFn();
  } catch (err) {
    console.error(`Provider ${providerName} failed:`, err);
    return [];
  }
};

// Individual provider functions
const getRiveStreams = async (tmdbId: string, episode: string, season: string, type: string): Promise<Source[]> => {
  const streams: Source[] = [];
  await getRiveNonEmbedStream(tmdbId, episode, season, type, streams);
  return streams;
};

const getAutoembedServer1 = async (tmdbId: string, episode: string, season: string, type: string): Promise<Source[]> => {
  const server1Url = type === "movie"
      ? `https://${atob(autoembed)}/embed/oplayer.php?id=${tmdbId}`
      : `https://${atob(autoembed)}/embed/oplayer.php?id=${tmdbId}&s=${season}&e=${episode}`;

  const links = await multiExtractor(server1Url);
  return links.map(({ lang, url }) => ({
    server: "Multi" + (lang ? `-${lang}` : ""),
    sources: [{ url, isM3U8: url.includes(".m3u8") }],
  }));
};

const getAutoembedServer4 = async (tmdbId: string, episode: string, season: string, type: string): Promise<Source[]> => {
  const server4Url = type === "movie"
      ? `https://${atob(autoembed)}/embed/player.php?id=${tmdbId}`
      : `https://${atob(autoembed)}/embed/player.php?id=${tmdbId}&s=${season}&e=${episode}`;

  const links4 = await multiExtractor(server4Url);
  return links4.map(({ lang, url }) => ({
    server: "Multi" + (lang ? `-${lang}` : ""),
    sources: [{ url, isM3U8: url.includes(".m3u8") }],
  }));
};

const getStableViet = async (tmdbId: string, episode: string, season: string, type: string): Promise<Source[]> => {
  const server3Url = type === "movie"
      ? `https://viet.${atob(autoembed)}/movie/${tmdbId}`
      : `https://viet.${atob(autoembed)}/tv/${tmdbId}/${season}/${episode}`;

  const links3 = await stableExtractor(server3Url);
  return links3.map(({ lang, url }) => ({
    server: "Stable-Viet " + (lang ? `-${lang}` : ""),
    sources: [{ url, isM3U8: url.includes(".m3u8") }],
  }));
};

const getTom = async (tmdbId: string, episode: string, season: string, type: string): Promise<Source[]> => {
  const server5Url = type === "movie"
      ? `https://tom.${atob(autoembed)}/api/getVideoSource?type=movie&id=${tmdbId}`
      : `https://tom.${atob(autoembed)}/api/getVideoSource?type=tv&id=${tmdbId}/${season}/${episode}`;

  const links5Res = await axios(server5Url, {
    timeout: 20000,
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
      Referer: `https://${atob(autoembed)}/`,
    },
  });

  const links5 = links5Res.data;
  if (links5.videoSource) {
    return [{
      server: "Tom",
      sources: [
        {
          url: links5.videoSource,
          isM3U8: links5.videoSource.includes(".m3u8"),
        },
      ],
    }];
  }
  return [];
};

// Main function to fetch all streams
export const allGetStream = async (
    tmdbId: string,
    episode: string,
    season: string,
    type: string
): Promise<Source[]> => {
  // Define all provider functions
  const providerFunctions = [
    { name: "Rive", fn: () => getRiveStreams(tmdbId, episode, season, type) },
    { name: "AutoembedServer1", fn: () => getAutoembedServer1(tmdbId, episode, season, type) },
    { name: "AutoembedServer4", fn: () => getAutoembedServer4(tmdbId, episode, season, type) },
    { name: "StableViet", fn: () => getStableViet(tmdbId, episode, season, type) },
    { name: "Tom", fn: () => getTom(tmdbId, episode, season, type) }
  ];

  // Execute all providers in parallel with individual error handling
  const results = await Promise.all(
      providerFunctions.map(provider =>
          safeProviderFetch(provider.name, provider.fn)
      )
  );

  // Combine all results
  return results.flat();
};