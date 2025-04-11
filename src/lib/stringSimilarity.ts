import {compareTwoStrings} from 'string-similarity';

// interface any {
//   title: string;
//   episodes?: {
//     sub: number;
//     dub?: number;
//   };
//   [key: string]: any; // For any additional properties
// }

// Function to find similar titles
export function findSimilarTitles(inputTitle: string, titles: any[]): any[] {
    const results: (any & { similarity: number })[] = [];

    titles?.forEach((titleObj: any) => {
        const title = cleanTitle(
            titleObj?.title?.toLowerCase()?.replace(/\([^\)]*\)/g, "").trim() || ""
        );

        // Calculate similarity score between inputTitle and title
        const similarity = compareTwoStrings(
            cleanTitle(inputTitle?.toLowerCase() || ""),
            title
        );

        if (similarity > 0.6) {
            results.push({...titleObj, similarity});
        }
    });

    const isSubAvailable = results.some(result =>
        result.episodes && result.episodes.sub > 0
    );

    // If episodes.sub is available, sort the results
    if (isSubAvailable) {
        return results.sort((a, b) => {
            // First sort by similarity in descending order
            if (b.similarity !== a.similarity) {
                return b.similarity - a.similarity;
            }
            // If similarity is the same, sort by episodes.sub in descending order
            return (b.episodes?.sub || 0) - (a.episodes?.sub || 0);
        });
    }

    // If episodes.sub is not available, return the original list
    return results.sort((a, b) => b.similarity - a.similarity);
}

// Function to convert Roman numerals to Arabic numbers
function romanToArabic(roman: string): number {
    const romanMap: Record<string, number> = {
        'i': 1,
        'v': 5,
        'x': 10,
        'l': 50,
        'c': 100,
        'd': 500,
        'm': 1000
    };

    roman = roman.toLowerCase();
    let result = 0;

    for (let i = 0; i < roman.length; i++) {
        const current = romanMap[roman[i]];
        const next = romanMap[roman[i + 1]];

        if (next && current < next) {
            result += next - current;
            i++;
        } else {
            result += current;
        }
    }

    return result;
}

export function cleanTitle(title: string | undefined | null): string {
    if (!title) return "";

    return transformSpecificVariations(
        removeSpecialChars(
            title
                .replaceAll(/[^A-Za-z0-9!@#$%^&*() ]/gim, " ")
                .replaceAll(/(th|rd|nd|st) (Season|season)/gim, "")
                .replaceAll(/\([^\(]*\)$/gim, "")
                .replaceAll("season", "")
                .replaceAll(/\b(IX|IV|V?I{0,3})\b/gi, (match) => romanToArabic(match).toString())
                .replaceAll("  ", " ")
                .replaceAll('"', "")
                .trimEnd()
        )
    );
}

export function removeSpecialChars(title: string | undefined | null): string {
    if (!title) return "";

    return title
        .replaceAll(/[^A-Za-z0-9!@#$%^&*()\-= ]/gim, " ")
        .replaceAll(/[^A-Za-z0-9\-= ]/gim, "")
        .replaceAll("  ", " ");
}

export function transformSpecificVariations(title: string | undefined | null): string {
    if (!title) return "";

    return title
        .replaceAll("yuu", "yu")
        .replaceAll(" ou", " oh");
}

export function sanitizeTitle(title: string): string {
    let resTitle = title.replace(
        / *(\(dub\)|\(sub\)|\(uncensored\)|\(uncut\)|\(subbed\)|\(dubbed\))/i,
        ""
    );
    resTitle = resTitle.replace(/ *\([^)]+audio\)/i, "");
    resTitle = resTitle.replace(/ BD( |$)/i, "");
    resTitle = resTitle.replace(/\(TV\)/g, "");
    resTitle = resTitle.trim();
    resTitle = resTitle.substring(0, 99); // truncate
    return resTitle;
}

export function stringSearch(string: string, pattern: string): number {
    let count = 0;
    string = string.toLowerCase();
    pattern = pattern.toLowerCase();
    string = string.replace(/[^a-zA-Z0-9 -]/g, "");
    pattern = pattern.replace(/[^a-zA-Z0-9 -]/g, "");

    for (let i = 0; i < string.length; i++) {
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] !== string[i + j]) break;
            if (j === pattern.length - 1) count++;
        }
    }
    return count;
}