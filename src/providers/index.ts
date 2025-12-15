import { Provider } from "./base";
import { ZoroProvider } from "./anime/zoro";
import { AnimeKaiProvider } from "./anime/animekai";
import { AnimePaheProvider } from "./anime/animepahe";

const providers: Record<string, Provider> = {
  zoro: new ZoroProvider(),
  animekai: new AnimeKaiProvider(),
  animepahe: new AnimePaheProvider(),
};

export function getProvider(name: string): Provider {
  return providers[name];
}

export function getAllProviders(): Provider[] {
  return Object.values(providers);
}

export {
  ZoroProvider,
  AnimeKaiProvider,
  AnimePaheProvider,
};
