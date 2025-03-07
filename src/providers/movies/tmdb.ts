import {
  IAnimeResult,
  IEpisodeServer,
  IMovieEpisode,
  IMovieInfo,
  ISearch,
  ISource,
  META,
  MixDrop,
  PROVIDERS_LIST,
  StreamingServers,
  TvType,
  VidCloud,
} from "@consumet/extensions";
import { Provider } from "../base";
import { Source } from "../../utils/types";
import { allGetStream } from "../../extractors";
import axios from "axios";
import { compareTwoStrings } from "../../utils/utils";
import { getRiveEmbedStream } from "../../extractors/rive-embed";
import { StreamTape, StreamWish, VidMoly, Voe } from "@consumet/extensions/dist/extractors";

const workingNonEmbedServers: string[] = [
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
  "multi",
  "stable",
];

export class TMDBProvider extends Provider {
  constructor() {
    super("tmdb");
  }
  client = new META.TMDB();

  async fetchEpisodes(
    id: string,
    type: string,
    provider?: string
  ): Promise<any> {
    type = String(type).toLowerCase() === "movie" ? "movie" : "tv";
    const infoUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=release_dates,watch/providers`;
    const seasonUrl = (season: string) =>
      `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${process.env.TMDB_API_KEY}`;
    const info: IMovieInfo = {
      id,
      title: "",
    };
    try {
      const { data } = await axios.get(infoUrl);

      // Handle provider-specific logic only if provider is given
      if (provider) {
        const possibleProvider = PROVIDERS_LIST.MOVIES.find(
          (p) => p.name.toLowerCase() === provider.toLowerCase()
        );

        if (possibleProvider) {
          const providerId = await this.findIdFromTitle(
            possibleProvider,
            data?.title || data?.name,
            {
              type: type === "movie" ? TvType.MOVIE : TvType.TVSERIES,
              totalSeasons: data?.number_of_seasons,
              totalEpisodes: data?.number_of_episodes,
              year: new Date(
                data?.release_date || data?.first_air_date
              ).getFullYear(),
            }
          );
          const InfoFromProvider = await possibleProvider.fetchMediaInfo(
            providerId!
          );
          info.id = providerId!;
          info.title = data?.title || data?.name;
          if (type === "movie") {
            info.episodeId = InfoFromProvider?.episodes![0]?.id;
          }
          const totalSeasons = (data?.number_of_seasons as number) || 0;
          if (type === "tv" && totalSeasons > 0) {
            // console.log("totalSeasons", totalSeasons);
            info.seasons = [];
            const seasons = info.seasons as any[];

            const providerEpisodes = InfoFromProvider?.episodes as any[];
            // console.log(
            //   "providerEpisodes",
            //   providerEpisodes
            // );
            if (providerEpisodes?.length < 1) return info;

            info.nextAiringEpisode = data?.next_episode_to_air
              ? {
                  season: data.next_episode_to_air?.season_number || undefined,
                  episode:
                    data.next_episode_to_air?.episode_number || undefined,
                  releaseDate: data.next_episode_to_air?.air_date || undefined,
                  title: data.next_episode_to_air?.name || undefined,
                  description: data.next_episode_to_air?.overview || undefined,
                  runtime: data.next_episode_to_air?.runtime || undefined,
                }
              : undefined;

            for (let i = 1; i <= totalSeasons; i++) {
              const { data: seasonData } = await axios.get(
                seasonUrl(i.toString())
              );

              //find season in each episode (providerEpisodes)
              const seasonEpisodes = providerEpisodes?.filter(
                (episode) => episode.season === i
              );
              console.log("seasonEpisodes", seasonEpisodes);
              const episodes =
                seasonData?.episodes?.length <= 0
                  ? undefined
                  : seasonData?.episodes.map((episode: any): IMovieEpisode => {
                      //find episode in each season (seasonEpisodes)
                      const episodeFromProvider = seasonEpisodes?.find(
                        (ep) => ep.number === episode.episode_number
                      );
                      console.log("episodeFromProvider", episodeFromProvider);
                      return {
                        id: episodeFromProvider?.id,
                        title: episode.name,
                        episode: episode.episode_number,
                        season: episode.season_number,
                        releaseDate: episode.air_date,
                        description: episode.overview,
                        url: episodeFromProvider?.url || undefined,
                        img: !episode?.still_path
                          ? undefined
                          : {
                              mobile: `https://image.tmdb.org/t/p/w300${episode.still_path}`,
                              hd: `https://image.tmdb.org/t/p/w780${episode.still_path}`,
                            },
                      };
                    });

              seasons.push({
                season: i,
                image: !seasonData?.poster_path
                  ? undefined
                  : {
                      mobile: `https://image.tmdb.org/t/p/w300${seasonData.poster_path}`,
                      hd: `https://image.tmdb.org/t/p/w780${seasonData.poster_path}`,
                    },
                episodes,
                isReleased:
                  seasonData?.episodes[0]?.air_date > new Date().toISOString()
                    ? false
                    : true,
              });
            }
          }
        }
      } else {
        const totalSeasons = data?.number_of_seasons || 0;
        if (type === "tv" && totalSeasons > 0) {
          info.seasons = [];
          const seasons = info.seasons as any[];

          info.nextAiringEpisode = data?.next_episode_to_air
            ? {
                season: data.next_episode_to_air?.season_number || undefined,
                episode: data.next_episode_to_air?.episode_number || undefined,
                releaseDate: data.next_episode_to_air?.air_date || undefined,
                title: data.next_episode_to_air?.name || undefined,
                description: data.next_episode_to_air?.overview || undefined,
                runtime: data.next_episode_to_air?.runtime || undefined,
              }
            : undefined;

          for (let i = 1; i <= totalSeasons; i++) {
            const { data: seasonData } = await axios.get(
              seasonUrl(i.toString())
            );

            const episodes =
              seasonData?.episodes?.length <= 0
                ? undefined
                : seasonData?.episodes.map((episode: any): IMovieEpisode => {
                    return {
                      id: `${id}-${type}-s${episode.season_number}-e${episode.episode_number}`,
                      uniqueId: `${id}-${type}-s${episode.season_number}-e${episode.episode_number}`,
                      title: episode.name,
                      episode: episode.episode_number,
                      season: episode.season_number,
                      releaseDate: episode.air_date,
                      description: episode.overview,
                      img: !episode?.still_path
                        ? undefined
                        : {
                            mobile: `https://image.tmdb.org/t/p/w300${episode.still_path}`,
                            hd: `https://image.tmdb.org/t/p/w780${episode.still_path}`,
                          },
                    };
                  });

            seasons.push({
              season: i,
              image: !seasonData?.poster_path
                ? undefined
                : {
                    mobile: `https://image.tmdb.org/t/p/w300${seasonData.poster_path}`,
                    hd: `https://image.tmdb.org/t/p/w780${seasonData.poster_path}`,
                  },
              episodes,
              isReleased:
                seasonData?.episodes[0]?.air_date > new Date().toISOString()
                  ? false
                  : true,
            });
          }
        } else {
          info.seasons = [];
          info.seasons.push({
            season: 1,
            image: !data?.poster_path
              ? undefined
              : `https://image.tmdb.org/t/p/w780${data.backdrop_path}`,
            episodes: [
              {
                id: `${id}-${type}-s1-e1`,
                uniqueId: `${id}-${type}-s1-e1`,
                title: data.title || data.original_title,
                episode: 1,
                season: 1,
                releaseDate: data.release_date,
                description: data.overview,
                img: !data?.backdrop_path
                  ? undefined
                  : {
                      mobile: `https://image.tmdb.org/t/p/w300${data.backdrop_path}`,
                      hd: `https://image.tmdb.org/t/p/w780${data.backdrop_path}`,
                    },
              },
            ],
          });
        }
      }
    } catch (err) {
      console.error("Error fetching episodes:", err);
      throw new Error((err as Error).message);
    }

    return info;
  }

  async fetchEpisodeSources(
    episodeId: string,
    episodeNumber: string,
    seasonNumber: string,
    type: string,
    server: string,
    embed: boolean
  ): Promise<Source> {
    if (embed) {
      const servers = await this.fetchEpisodeServers(
        episodeId,
        episodeNumber,
        seasonNumber,
        type,
        embed
      );
      const index = servers.findIndex(
        (s) => s.name.toLowerCase() === server.toLowerCase()
      );
      const serverUrl = new URL(servers[index].url);
      console.log(servers[index]);
      switch (server.split("-")[0]) {
        case StreamingServers.MixDrop:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop().extract(serverUrl),
          };
        case StreamingServers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new VidCloud().extract(serverUrl)),
          };
        case StreamingServers.StreamWish:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new StreamWish().extract(serverUrl)),
          };
        case StreamingServers.Voe:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new Voe().extract(serverUrl)),
          };
        case StreamingServers.VidMoly:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new VidMoly().extract(serverUrl),
          };
        case StreamingServers.StreamTape:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new StreamTape().extract(serverUrl),
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop().extract(serverUrl),
          };
      }
    } else {
      const stream = await allGetStream(
        episodeId,
        episodeNumber,
        seasonNumber,
        type
      );
      return stream.filter(
        (stream) => stream?.server!.toLowerCase() === server.toLowerCase()
      )[0];
    }
  }

  async fetchEpisodeServers(
    episodeId: string,
    episodeNumber: string,
    seasonNumber: string,
    type: string,
    embed: boolean
  ): Promise<IEpisodeServer[]> {
    const stream = await allGetStream(
      episodeId,
      episodeNumber,
      seasonNumber,
      type
    );
    if (embed) {
      const stream = await getRiveEmbedStream(
        episodeId,
        episodeNumber,
        seasonNumber,
        type
      );
      const workingEmbedServers = [
        "mixdrop",
        "pepepeyo",
        "zizicoi",
        "hanatyury",
        "streamtape",
        "streamwish",
        "vidmoly",
        "voe",
      ];
      return stream
        ?.filter((item: { host: string; link: string }) =>
          workingEmbedServers.some((server) => item?.host?.includes(server))
        )
        .map((item: { host: string; link: string }, index) => ({
          name:
            item.host.includes("zizicoi") ||
            item.host.includes("pepepeyo") ||
            item.host.includes("hanatyury")
              ? `vidcloud-${index}`
              : `${item.host.split(".")[0]}-${index}`,
          url: item.link,
        }));
    } else {
      const serverUrls = stream.map((s) => ({
        name: s.server,
        url: s.sources[0].url,
      }));

      const validServers = await Promise.all(
        serverUrls.map(async (server) => {
          try {
            await axios.head(server.url);
            return server;
          } catch (error) {
            return null;
          }
        })
      );

      return validServers.filter(
        (server): server is { name: string; url: string } => server !== null
      );
    }
    return [];
  }

  private findIdFromTitle = async (
    possibleProvider: any,
    title: string,
    extraData: {
      type: TvType;
      year?: number;
      totalSeasons?: number;
      totalEpisodes?: number;
      [key: string]: any;
    }
  ): Promise<string | undefined> => {
    //clean title
    title = title.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();

    const findMedia = (await possibleProvider.search(
      title
    )) as ISearch<IAnimeResult>;
    if (findMedia.results.length === 0) return "";

    // console.log(extraData);
    // console.log(findMedia.results);

    // Sort the retrieved info for more accurate results.
    findMedia.results.sort((a, b) => {
      const targetTitle = title;

      let firstTitle: string;
      let secondTitle: string;

      if (typeof a.title == "string") firstTitle = a?.title as string;
      else firstTitle = (a?.title as string) ?? "";

      if (typeof b.title == "string") secondTitle = b.title as string;
      else secondTitle = (b?.title as string) ?? "";

      const firstRating = compareTwoStrings(
        targetTitle,
        firstTitle.toLowerCase()
      );
      const secondRating = compareTwoStrings(
        targetTitle,
        secondTitle.toLowerCase()
      );

      // Sort in descending order
      return secondRating - firstRating;
    });

    //remove results that dont match the type
    findMedia.results = findMedia.results.filter((result) => {
      if (extraData.type === TvType.MOVIE)
        return (result.type as string) === TvType.MOVIE;
      else if (extraData.type === TvType.TVSERIES)
        return (result.type as string) === TvType.TVSERIES;
      else return result;
    });

    // if extraData contains a year, filter out the results that don't match the year
    if (extraData && extraData.year && extraData.type === TvType.MOVIE) {
      findMedia.results = findMedia.results.filter((result) => {
        return result.releaseDate?.split("-")[0] === extraData.year;
      });
    }

    // console.log({ test1: findMedia.results });

    // Check if the result contains the total number of seasons and compare it to the extraData.
    // Allow for a range of ±2 seasons and ensure that the seasons value is a number.
    if (
      extraData &&
      extraData.totalSeasons &&
      extraData.type === TvType.TVSERIES
    ) {
      findMedia.results = findMedia.results.filter((result) => {
        const totalSeasons = (result.seasons as number) || 0;
        const extraDataSeasons = (extraData.totalSeasons as number) || 0;
        return (
          totalSeasons >= extraDataSeasons - 2 &&
          totalSeasons <= extraDataSeasons + 2
        );
      });
    }

    // console.log(findMedia.results);

    return findMedia?.results[0]?.id || undefined;
  };
}
