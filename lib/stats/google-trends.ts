import googleTrends from "google-trends-api";
import type { HypeStatsSnapshot } from "@/lib/ai/stats-snapshot-prompt";

const TRENDS_MS = 90 * 24 * 60 * 60 * 1000;

function trendDirectionLabel(delta: number): string {
  if (delta > 10) return "Rising fast";
  if (delta > 0) return "Rising";
  if (delta < -10) return "Falling fast";
  if (delta < 0) return "Falling";
  return "Stable";
}

function clampTrendsValue(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** ~90d interest-over-time window, worldwide web search. */
export async function fetchGoogleTrendsSnapshot(
  term: string,
): Promise<HypeStatsSnapshot["googleTrends"]> {
  const keyword = term.trim();
  if (!keyword) return null;

  const endTime = new Date();
  const startTime = new Date(Date.now() - TRENDS_MS);

  const raw = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
  });

  const parsed = JSON.parse(raw) as {
    default?: { timelineData?: Array<{ value?: number[] }> };
  };
  const points = parsed.default?.timelineData;
  if (!points?.length) return null;

  const first = points[0]?.value?.[0];
  const last = points[points.length - 1]?.value?.[0];
  if (first === undefined || last === undefined) return null;

  const scoreAtWindowStart = clampTrendsValue(first);
  const currentScore = clampTrendsValue(last);
  const delta = currentScore - scoreAtWindowStart;

  return {
    currentScore,
    scoreAtWindowStart,
    delta,
    directionLabel: trendDirectionLabel(delta),
  };
}
