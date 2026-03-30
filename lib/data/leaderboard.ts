import { hypeAnalysisSchema } from "@/lib/hype-analysis-schema";
import { currentWeekStartISO } from "@/lib/helpers/date";
import {
  getServiceSupabase,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

/** Row for `/leaderboard`: recent reports with hype scores from `payload`. */
export type LeaderboardEntry = {
  id: string;
  slug: string;
  term: string;
  hype_score: number;
  real_value_percent: number;
  verdict: string;
  created_at: string;
};

/**
 * Current-week reports (created_at >= Monday 00:00 UTC), deduped by normalized term name
 * (highest hype wins), sorted by hype score descending.
 */
export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  if (!isSupabaseServiceConfigured()) return [];

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("reports")
    .select("id, created_at, payload, terms!inner(name, slug)")
    .gte("created_at", currentWeekStartISO())
    .filter("payload->hypeScore", "gt", 0);

  if (error) {
    console.error(
      "[data/leaderboard] getLeaderboardEntries",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return [];
  }

  type TermRow = { name: string; slug: string };
  const rows = data as
    | {
        id: string;
        created_at: string;
        payload: unknown;
        terms: TermRow | TermRow[] | null;
      }[]
    | null;

  const seen = new Map<string, LeaderboardEntry>();

  for (const row of rows ?? []) {
    const termRel = row.terms;
    const termRow = Array.isArray(termRel) ? termRel[0] : termRel;
    if (!termRow?.name || !termRow.slug) continue;

    const parsed = hypeAnalysisSchema.safeParse(row.payload);
    if (!parsed.success) continue;

    const a = parsed.data;
    const entry: LeaderboardEntry = {
      id: row.id,
      slug: termRow.slug,
      term: termRow.name,
      hype_score: a.hypeScore,
      real_value_percent: a.realValuePercent,
      verdict: a.verdict,
      created_at: row.created_at,
    };

    const key = entry.term.toLowerCase().trim();
    const prev = seen.get(key);
    if (!prev || entry.hype_score > prev.hype_score) {
      seen.set(key, entry);
    }
  }

  return Array.from(seen.values())
    .sort((x, y) => y.hype_score - x.hype_score)
    .slice(0, 50);
}

/** Compact row for landing preview. */
export type LeaderboardPreviewEntry = {
  id: string;
  slug: string;
  term: string;
  hype_score: number;
};

export async function getLeaderboardPreviewEntries(
  limit = 5,
): Promise<LeaderboardPreviewEntry[]> {
  const rows = await getLeaderboardEntries();
  return rows.slice(0, limit).map(({ id, slug, term, hype_score }) => ({
    id,
    slug,
    term,
    hype_score,
  }));
}
