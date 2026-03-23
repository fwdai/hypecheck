import type { HypeStatsSnapshot } from "@/lib/ai/stats-snapshot-prompt";
import { fetchGithubRepoSnapshot } from "@/lib/stats/github";
import { fetchGoogleTrendsSnapshot } from "@/lib/stats/google-trends";

export type { HypeStatsSnapshot } from "@/lib/ai/stats-snapshot-prompt";

/**
 * Composes per-provider fetches into one snapshot. Failures are swallowed per
 * source so analysis can still run.
 */
export async function fetchHypeStatsSnapshot(
  term: string,
): Promise<HypeStatsSnapshot> {
  const [trendsResult, ghResult] = await Promise.allSettled([
    fetchGoogleTrendsSnapshot(term),
    fetchGithubRepoSnapshot(term),
  ]);

  let googleTrends: HypeStatsSnapshot["googleTrends"] = null;
  if (trendsResult.status === "fulfilled") {
    googleTrends = trendsResult.value;
  } else {
    console.warn("[stats/snapshot] Google Trends failed:", trendsResult.reason);
  }

  let github: HypeStatsSnapshot["github"] = null;
  if (ghResult.status === "fulfilled") {
    github = ghResult.value;
  } else {
    console.warn("[stats/snapshot] GitHub failed:", ghResult.reason);
  }

  return { googleTrends, github };
}
