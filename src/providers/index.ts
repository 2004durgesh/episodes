import { Provider } from "./base";
import { ZoroProvider } from "./anime/zoro";
import { TMDBProvider } from "./movies/tmdb";
import { AnimeKaiProvider } from "./anime/animekai";
import { AnimePaheProvider } from "./anime/animepahe";

const providers: Record<string, Provider> = {
  zoro: new ZoroProvider(),
  animekai: new AnimeKaiProvider(),
  animepahe: new AnimePaheProvider(),
  tmdb: new TMDBProvider(),
};

export function getProvider(name: string): Provider {
  return providers[name];
}

export function getAllProviders(): Provider[] {
  return Object.values(providers);
}

export {
  ZoroProvider,
  TMDBProvider,
  AnimeKaiProvider,
  AnimePaheProvider,
};
