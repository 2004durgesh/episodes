import { Provider } from "./base";
import { GogoAnimeProvider } from "./anime/gogoanime";
import { ZoroProvider } from "./anime/zoro";
import { TMDBProvider } from "./movies/tmdb";
import { AnimeKaiProvider } from "./anime/animekai";

const providers: Record<string, Provider> = {
  gogoanime: new GogoAnimeProvider(),
  zoro: new ZoroProvider(),
  animekai: new AnimeKaiProvider(),
  tmdb: new TMDBProvider(),
};

export function getProvider(name: string): Provider {
  return providers[name];
}

export function getAllProviders(): Provider[] {
  return Object.values(providers);
}

export { GogoAnimeProvider, ZoroProvider, TMDBProvider, AnimeKaiProvider };
