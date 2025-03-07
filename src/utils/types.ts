import { ISubtitle, IVideo } from "@consumet/extensions";

export interface EpisodeTitle {
  "x-jat"?: string;
  en?: string;
  ja?: string;
  [key: string]: string | undefined;
}

// Episode export Interface
export interface Episode {
  title: EpisodeTitle;
  tvdbId?: number;
  sedbShowId?: number;
  tvasonNumber?: number;
  episodeNumber?: number;
  absoluteEpisodeNumber?: number;
  airDate?: string;
  airDateUtc?: string;
  runtime?: number;
  overview?: string;
  image?: string;
  episode: string;
  anidbEid?: number;
  length?: number;
  airdate?: string;
  rating?: string;
  summary?: string;
  finaleType?: string;
}

export interface Mappings {
  sub?: string;
  dub?: string;
  uncensored?: string;
  [key: string]: string | undefined;
}

export type MetaProvider = "anilist" | "mal";

export interface Source {
  server?: string;
  headers?: {
    [k: string]: string;
  };
  subtitles?: ISubtitle[];
  sources: IVideo[];
  download?: string;
  embedURL?: string;
}

export interface RiveEmbedSource {
  link: string;
  host: string;
  host_id: string;
}
