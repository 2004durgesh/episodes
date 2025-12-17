import { IAnimeResult, ISearch } from "@consumet/extensions/dist";
import { AnimeParser } from "@consumet/extensions/dist/models";

function extractResults(res: unknown): IAnimeResult[] {
  if (Array.isArray(res)) return res as IAnimeResult[];
  const obj = res as { results?: unknown } | null;
  const results = obj?.results;
  return Array.isArray(results) ? (results as IAnimeResult[]) : [];
}

function extractPagination(res: unknown): {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
} {
  const obj = res as ISearch<IAnimeResult> | null;
  const currentPage =
    typeof obj?.currentPage === "number" ? obj.currentPage : undefined;
  const hasNextPage =
    typeof obj?.hasNextPage === "boolean" ? obj.hasNextPage : undefined;
  const totalPages =
    typeof obj?.totalPages === "number" ? obj.totalPages : undefined;

  return { currentPage, hasNextPage, totalPages };
}

export async function fetchAllSearchResults(
  fetchPage: AnimeParser["search"],
  query: string,
  maxSequentialPages: number = 5
): Promise<IAnimeResult[]> {
  const firstPage = await fetchPage(query, 1);
  const results: IAnimeResult[] = [...extractResults(firstPage)];

  const { currentPage, hasNextPage, totalPages } = extractPagination(firstPage);

  // If totalPages is available, fetch remaining pages in parallel.
  if (Number.isFinite(totalPages) && (totalPages ?? 1) > 1) {
    const pagePromises = Array.from(
      { length: (totalPages as number) - 1 },
      (_, i) => fetchPage(query, i + 2)
    );

    const settled = await Promise.allSettled(pagePromises);
    for (const res of settled) {
      if (res.status === "fulfilled") {
        results.push(...extractResults(res.value));
      }
    }
    return results;
  }

  // Fallback: if the API exposes currentPage/hasNextPage but not totalPages,
  // fetch sequentially until hasNextPage is false (with a safety cap).
  if (hasNextPage === true) {
    let nextPage = (currentPage ?? 1) + 1;
    let pagesFetched = 1;
    let stillHasNext = true;

    while (stillHasNext && pagesFetched < maxSequentialPages) {
      try {
        const pageRes = await fetchPage(query, nextPage);
        results.push(...extractResults(pageRes));

        const p = extractPagination(pageRes);
        stillHasNext = p.hasNextPage === true;
        nextPage = (p.currentPage ?? nextPage) + 1;
        pagesFetched++;
      } catch {
        break;
      }
    }
  }

  return results;
}
