import axios from "axios";
import { RiveEmbedSource } from "../utils/types";
import { generateSecretKey } from "../utils/utils";

export async function getRiveEmbedStream(
    tmdbId: string,
    episode: string,
    season: string,
    type: string
): Promise<RiveEmbedSource[]> {
    try {
        const secret = generateSecretKey(Number(tmdbId));
        const baseUrl = "https://rivestream.net";
        // console.log(tmdbId, episode, season, type);
        const route = `/api/backendfetch?requestID=EmbedProviderServices&secretKey=rive&proxyMode=noProxy`;
        const serviceRoute =
            type === "series" || type === "tv"
                ? `/api/backendfetch?requestID=tvEmbedProvider&id=${tmdbId}&season=${season}&episode=${episode}&secretKey=${secret}&service=`
                : `/api/backendfetch?requestID=movieEmbedProvider&id=${tmdbId}&secretKey=${secret}&service=`;
        const url = baseUrl + route;

        const { data } = await axios.get(url);
        const sources: RiveEmbedSource[] = [];

        if (!data || !data.data || !Array.isArray(data.data)) {
            console.log("Rive: Invalid response format - missing data array");
            return [];
        }

        await Promise.all(
            data.data.map(async (service: string) => {
                // console.log(`Rive: ${service}`);
                const url = baseUrl + serviceRoute + service;
                try {
                    const { data: serviceData } = await axios.get(url);

                    if (serviceData && serviceData.data && serviceData.data.sources) {
                        sources.push(...serviceData.data.sources);
                    } else {
                        console.log(`Rive: No sources found for service ${service}`);
                    }
                } catch (e) {
                    console.log(`Rive service ${service} error:`, e);
                    // Don't rethrow the error, just log it and continue
                }
            })
        );

        return sources;
    } catch (e) {
        console.error("Rive main error:", e);
        return []; // Return empty array instead of throwing
    }
}
