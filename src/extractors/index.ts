import { Source } from "../utils/types";
import { multiExtractor } from "./multi";
import { stableExtractor } from "./stable";
import { getRiveNonEmbedStream } from "./rive-nonembed";
import axios from "axios";

const autoembed = "YXV0b2VtYmVkLmNj";
export const allGetStream = async (
  tmdbId: string,
  episode: string,
  season: string,
  type: string
): Promise<Source[]> => {
  try {
    // console.log(id);
    const streams: Source[] = [];

    ///// rive
    await getRiveNonEmbedStream(tmdbId, episode, season, type, streams);

    ///// autoembed
    // server1

    const server1Url =
      type === "movie"
        ? `https://${atob(autoembed)}/embed/oplayer.php?id=${tmdbId}`
        : `https://${atob(
            autoembed
          )}/embed/oplayer.php?id=${tmdbId}&s=${season}&e=${episode}`;
    const links = await multiExtractor(server1Url);
    links.forEach(({ lang, url }) => {
      streams.push({
        server: "Multi"+ (lang ? `-${lang}` : ""),
        sources: [{ url, isM3U8: url.includes(".m3u8") }],
      });
    });

    // server 2

    // const server2Url =
    //   type === 'movie'
    //     ? `https://duka.${atob(autoembed)}/movie/${imdbId}`
    //     : `https://duka.${atob(autoembed)}/tv/${imdbId}/${season}/${episode}`;
    // const links2 = await stableExtractor(server2Url);
    // links2.forEach(({lang, url}) => {
    //   streams.push({
    //     server: 'Stable ' + (lang ? `-${lang}` : ''),
    //     link: url,
    //     type: 'm3u8',
    //   });
    // });

    // server 4

    const server4Url =
      type === "movie"
        ? `https://${atob(autoembed)}/embed/player.php?id=${tmdbId}`
        : `https://${atob(
            autoembed
          )}/embed/player.php?id=${tmdbId}&s=${season}&e=${episode}`;
    // console.log(server4Url);
    const links4 = await multiExtractor(server4Url);
    links4.forEach(({ lang, url }) => {
      streams.push({
        server: "Multi" + (lang ? `-${lang}` : ""),
        sources: [{ url, isM3U8: url.includes(".m3u8") }],
      });
    });

    // server 3

    const server3Url =
      type === "movie"
        ? `https://viet.${atob(autoembed)}/movie/${tmdbId}`
        : `https://viet.${atob(autoembed)}/tv/${tmdbId}/${season}/${episode}`;
    const links3 = await stableExtractor(server3Url);
    links3.forEach(({ lang, url }) => {
      streams.push({
        server: "Stable-Viet "+ (lang ? `-${lang}` : ""),
        sources: [{ url, isM3U8: url.includes(".m3u8") }],
      });
    });

    // server 5

    const server5Url =
      type === "movie"
        ? `https://tom.${atob(
            autoembed
          )}/api/getVideoSource?type=movie&id=${tmdbId}`
        : `https://tom.${atob(
            autoembed
          )}/api/getVideoSource?type=tv&id=${tmdbId}/${season}/${episode}`;
    try {
      const links5Res = await axios(server5Url, {
        timeout: 20000,
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
          Referer: `https://${atob(autoembed)}/`,
        },
      });
      const links5 = links5Res.data;
      if (links5.videoSource) {
        streams.push({
          server: "Tom",
          sources: [
            {
              url: links5.videoSource,
              isM3U8: links5.videoSource.includes(".m3u8"),
            },
          ],
        });
      }
    } catch (err) {
      // console.error("Tom", err);
    }
    return streams;
  } catch (err) {
    console.error(err);
    return [];
  }
};
