/**
 * Point-in-time external stats (Trends, GitHub, etc.) collected when we run analysis.
 * Fed to the model as grounding; the name emphasizes that it is a live snapshot, not timeless truth.
 */
export type HypeStatsSnapshot = {
  googleTrends: {
    /** Relative interest 0–100 (Google’s scale for the window). */
    currentScore: number;
    scoreAtWindowStart: number;
    delta: number;
    directionLabel: string;
  } | null;
  github: {
    totalRepoCount: number;
    recent30DayRepoCount: number;
  } | null;
};

/** User-message block for the model; empty string if no stats were available. */
export function formatStatsSnapshotForPrompt(
  snapshot: HypeStatsSnapshot,
): string {
  const lines: string[] = [];

  if (snapshot.googleTrends) {
    const g = snapshot.googleTrends;
    const deltaStr = `${g.delta > 0 ? "+" : ""}${g.delta}`;
    lines.push(
      "GOOGLE TRENDS (last ~90 days, worldwide web search, relative 0–100):",
    );
    lines.push(`- Current interest score: ${g.currentScore}/100`);
    lines.push(`- Score at start of window: ${g.scoreAtWindowStart}/100`);
    lines.push(`- Delta vs start of window: ${deltaStr} points`);
    lines.push(`- Direction: ${g.directionLabel}`);
  }

  if (snapshot.github) {
    lines.push("GITHUB (repository search, term in readme/name/topics/etc.):");
    lines.push(
      `- Total repositories (approx.): ${snapshot.github.totalRepoCount}`,
    );
    lines.push(
      `- Repositories created in the last 30 days (approx.): ${snapshot.github.recent30DayRepoCount}`,
    );
  }

  if (lines.length === 0) {
    return "";
  }

  return [
    "REAL-WORLD DATA ANCHORS (request-time external signals; use as quantitative evidence when scoring hype vs substance):",
    "",
    ...lines,
    "",
    "Interpretation hints: very high Trends interest with relatively few GitHub repos can indicate buzz outpacing engineering footprint; moderate Trends with very high repo counts often indicates broad, ongoing adoption. Trends are relative to the term’s own peak in the window, not absolute search volume.",
    "",
  ].join("\n");
}
