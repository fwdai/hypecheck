import { randomBytes } from "node:crypto";

import { generateHypeAnalysis } from "@/lib/ai/generate-hype-analysis";
import type { HypeStatsSnapshot } from "@/lib/ai/stats-snapshot-prompt";
import {
  currentWeekStartISO,
  reportWeekExpiresAtISO,
} from "@/lib/helpers/date";
import {
  hypeAnalysisSchema,
  type ParsedHypeAnalysis,
} from "@/lib/hype-analysis-schema";
import { normalizeQuery } from "@/lib/normalize-query";
import { fetchHypeStatsSnapshot } from "@/lib/stats";
import {
  getServiceSupabase,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

function parseReportRow(
  row: { id: string; payload: unknown } | null,
): { reportId: string; analysis: ParsedHypeAnalysis } | null {
  if (!row?.payload) return null;
  const parsed = hypeAnalysisSchema.safeParse(row.payload);
  if (!parsed.success) {
    console.error("[measure-store] cached payload invalid", parsed.error);
    return null;
  }
  return { reportId: row.id, analysis: parsed.data };
}

/** Canonical term row; `score` is set only when resolved via trigram similarity. */
type Term = {
  id: string;
  name: string;
  slug: string;
  score?: number;
};

function slugifyForTerm(name: string): string {
  const s = normalizeQuery(name)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s.length > 0 ? s : "term";
}

/**
 * Insert a canonical term for user input (slug derived from text; retries on slug collision).
 */
export async function createTerm(displayName: string): Promise<Term | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const name = displayName.trim();
  if (!name) return null;

  const supabase = getServiceSupabase();
  let slug = slugifyForTerm(name);

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await supabase
      .from("terms")
      .insert({ name, slug })
      .select("id, name, slug")
      .single();

    if (!error && data) {
      return data as Term;
    }

    const code = (error as { code?: string } | null)?.code;
    if (code === "23505") {
      slug = `${slugifyForTerm(name)}-${randomBytes(3).toString("hex")}`;
      continue;
    }

    console.error(
      "[measure-store] createTerm",
      error?.message ?? error,
      (error as { details?: string })?.details ?? "",
      (error as { hint?: string })?.hint ?? "",
    );
    return null;
  }

  return null;
}

/**
 * Fuzzy-match user input to a canonical term (trigram similarity > 0.3 and
 * normalized Levenshtein distance ≤ 0.36, so shared-prefix false positives are rejected).
 * Returns null when no row qualifies or Supabase is unavailable.
 */
export async function matchTermBySimilarity(
  queryText: string,
): Promise<Term | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("match_term_by_similarity", {
    p_query: queryText,
  });

  if (error) {
    console.error(
      "[measure-store] match_term_by_similarity",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return null;
  }

  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? [data as { id: string; name: string; slug: string; score: unknown }]
      : [];
  const row = rows[0];
  if (!row?.id) return null;
  const score = Number(row.score);
  if (!Number.isFinite(score)) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    score,
  };
}

async function getTermBySlug(slug: string): Promise<Term | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const s = slug.trim();
  if (!s) return null;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("terms")
    .select("id, name, slug")
    .eq("slug", s)
    .maybeSingle();

  if (error) {
    console.error(
      "[measure-store] getTermBySlug",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return null;
  }

  if (!data) return null;
  return data as Term;
}

export async function getVoteCountsForReport(
  reportId: string,
): Promise<{ agrees: number; disagrees: number }> {
  if (!isSupabaseServiceConfigured()) {
    return { agrees: 0, disagrees: 0 };
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("report_votes")
    .select("vote_type")
    .eq("report_id", reportId);

  if (error) {
    console.error(
      "[measure-store] getVoteCountsForReport",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return { agrees: 0, disagrees: 0 };
  }

  let agrees = 0;
  let disagrees = 0;
  for (const row of data ?? []) {
    if (row.vote_type === true) agrees++;
    else if (row.vote_type === false) disagrees++;
  }
  return { agrees, disagrees };
}

export type CastReportVoteResult =
  | {
      ok: true;
      agrees: number;
      disagrees: number;
      alreadyVoted: boolean;
      yourVote?: "agree" | "disagree";
    }
  | { ok: false; error: string };

export async function castReportVote(params: {
  reportId: string;
  voteType: "agree" | "disagree";
  visitorSessionId: string;
}): Promise<CastReportVoteResult> {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false, error: "Voting is unavailable." };
  }

  const sessionId = params.visitorSessionId.trim().slice(0, 128);
  if (!sessionId) {
    return { ok: false, error: "Missing session." };
  }

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("report_votes").insert({
    report_id: params.reportId,
    visitor_session_id: sessionId,
    vote_type: params.voteType === "agree",
  });

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      const { data: row } = await supabase
        .from("report_votes")
        .select("vote_type")
        .eq("report_id", params.reportId)
        .eq("visitor_session_id", sessionId)
        .maybeSingle();
      const counts = await getVoteCountsForReport(params.reportId);
      const yourVote =
        row?.vote_type === true
          ? "agree"
          : row?.vote_type === false
            ? "disagree"
            : undefined;
      return {
        ok: true,
        ...counts,
        alreadyVoted: true,
        yourVote,
      };
    }
    console.error(
      "[measure-store] castReportVote",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return { ok: false, error: "Could not record vote." };
  }

  const counts = await getVoteCountsForReport(params.reportId);
  return { ok: true, ...counts, alreadyVoted: false };
}

/**
 * Canonical term label + current-week report for `/hype/[slug]` (SSR).
 * When the term exists but there is no report for this ISO week yet, runs the same
 * stats + LLM + insert pipeline as `POST /api/measure` before returning.
 */
export async function getHypeReportBySlug(slug: string): Promise<{
  termName: string;
  analysis: ParsedHypeAnalysis;
  reportId: string;
  agrees: number;
  disagrees: number;
} | null> {
  const term = await getTermBySlug(slug);
  if (!term) return null;

  let report = await findRecentReportForTerm(term.id);
  if (!report) {
    await ensureCurrentWeekReportForTerm({
      termId: term.id,
      termName: term.name,
    });
    report = await findRecentReportForTerm(term.id);
  }
  if (!report) return null;

  const { agrees, disagrees } = await getVoteCountsForReport(report.reportId);

  return {
    termName: term.name,
    analysis: report.analysis,
    reportId: report.reportId,
    agrees,
    disagrees,
  };
}

/**
 * Latest report for this term created in the current ISO week (UTC, Monday start).
 */
export async function findRecentReportForTerm(
  termId: string,
): Promise<{ reportId: string; analysis: ParsedHypeAnalysis } | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("id, payload")
    .eq("term_id", termId)
    .gte("created_at", currentWeekStartISO())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "[measure-store] findRecentReportForTerm",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return null;
  }

  return parseReportRow(data ? { id: data.id, payload: data.payload } : null);
}

/** Shown when Supabase is off or there is not enough query history yet. */
const DEFAULT_LANDING_SUGGESTIONS = [
  "AI Agents",
  "OpenClaw",
  "AGI",
  "Web3",
  "Quantum Computing",
  "MCP Servers",
  "Vibe Coding",
  "Rust",
];

/**
 * Most frequently submitted queries (by normalized_query), using the latest
 * raw_query string in each group as the chip label. Requires migration
 * `get_top_queries`; falls back to defaults when DB is empty or unavailable.
 */
export async function getTopTrendingQueries(limit = 10): Promise<string[]> {
  const capped = Math.min(50, Math.max(1, Math.floor(limit)));
  if (!isSupabaseServiceConfigured()) {
    return DEFAULT_LANDING_SUGGESTIONS.slice(0, capped);
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("get_top_queries", {
    p_limit: capped,
  });

  if (error) {
    console.error(
      "[measure-store] get_top_queries",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return DEFAULT_LANDING_SUGGESTIONS.slice(0, capped);
  }

  const rows = data as { display_query: string; query_count: number }[] | null;
  const labels =
    rows
      ?.map((r) => r.display_query?.trim())
      .filter((s): s is string => Boolean(s)) ?? [];

  if (labels.length === 0) {
    return DEFAULT_LANDING_SUGGESTIONS.slice(0, capped);
  }

  return labels.slice(0, capped);
}

/** Inserts a new weekly report row (historical rows are kept). Handles concurrent duplicate-week inserts. */
export async function insertReportFromLlm(params: {
  termId: string;
  analysis: ParsedHypeAnalysis;
  model: string;
}): Promise<string | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = getServiceSupabase();
  const now = new Date();
  const expiresAt = reportWeekExpiresAtISO(now);

  const { data, error } = await supabase
    .from("reports")
    .insert({
      term_id: params.termId,
      payload: params.analysis,
      model: params.model,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (!error && data?.id) {
    return data.id;
  }

  const code = (error as { code?: string } | null)?.code;
  if (code === "23505") {
    const existing = await findRecentReportForTerm(params.termId);
    return existing?.reportId ?? null;
  }

  console.error(
    "[measure-store] insertReportFromLlm",
    error?.message ?? error,
    (error as { details?: string })?.details ?? "",
    (error as { hint?: string })?.hint ?? "",
  );
  return null;
}

/**
 * Ensures a report row exists for the current ISO week (UTC). If none, fetches stats,
 * runs the LLM, and inserts. Used by `/hype/[slug]` and `POST /api/measure`.
 */
export async function ensureCurrentWeekReportForTerm(params: {
  termId: string;
  termName: string;
}): Promise<void> {
  if (!isSupabaseServiceConfigured()) {
    throw new Error("Database is not configured.");
  }

  const existing = await findRecentReportForTerm(params.termId);
  if (existing) return;

  const statsSnapshot = await fetchHypeStatsSnapshot(params.termName);
  await upsertWeeklyTermStats({
    termId: params.termId,
    snapshot: statsSnapshot,
  });
  const { analysis, model } = await generateHypeAnalysis(
    params.termName,
    statsSnapshot,
  );
  const id = await insertReportFromLlm({
    termId: params.termId,
    analysis,
    model,
  });
  if (!id) {
    throw new Error("Could not save hype report.");
  }
}

/**
 * Persists API stats (Google Trends, GitHub) for a term. Upserts on `term_id`.
 * No-op when Supabase is not configured.
 */
export async function upsertWeeklyTermStats(params: {
  termId: string;
  snapshot: HypeStatsSnapshot;
}): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;

  const supabase = getServiceSupabase();
  const fetchedAt = new Date().toISOString();

  const { error } = await supabase.from("weekly_term_stats").upsert(
    {
      term_id: params.termId,
      google_trends: params.snapshot.googleTrends,
      github: params.snapshot.github,
      fetched_at: fetchedAt,
    },
    { onConflict: "term_id" },
  );

  if (error) {
    console.error(
      "[measure-store] upsertWeeklyTermStats",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
  }
}

export async function recordQuery(params: {
  rawQuery: string;
  normalizedQuery: string;
  visitorSessionId: string | null;
  userAgent: string | null;
  /** Resolved client IP (IPv4/IPv6 string); stored in `queries.ip`. */
  clientIp: string | null;
  ipHash: string | null;
  /** Canonical term when the query fuzzy-matched `terms`. */
  termId?: string | null;
}): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;

  const supabase = getServiceSupabase();

  const { error: e1 } = await supabase.from("queries").insert({
    raw_query: params.rawQuery,
    normalized_query: params.normalizedQuery,
    visitor_session_id: params.visitorSessionId,
    user_agent: params.userAgent,
    ip: params.clientIp,
    ip_hash: params.ipHash,
    term_id: params.termId ?? null,
  });

  if (e1) {
    console.error(
      "[measure-store] insert queries",
      e1.message,
      e1.details ?? "",
      e1.hint ?? "",
    );
  }
}

/** Slugs with a current-week report, for `/hype/[slug]` sitemap entries. */
export async function getSitemapHypeSlugs(): Promise<
  { slug: string; lastModified: Date | undefined }[]
> {
  if (!isSupabaseServiceConfigured()) return [];

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("created_at, terms!inner(slug)")
    .gte("created_at", currentWeekStartISO());

  if (error) {
    console.error(
      "[measure-store] getSitemapHypeSlugs",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return [];
  }

  type TermRow = { slug: string };
  const rows = data as
    | {
        created_at: string;
        terms: TermRow | TermRow[] | null;
      }[]
    | null;

  const best = new Map<string, string>();
  for (const row of rows ?? []) {
    const termRel = row.terms;
    const termRow = Array.isArray(termRel) ? termRel[0] : termRel;
    const slug = termRow?.slug?.trim();
    if (!slug) continue;
    const t = row.created_at;
    const prev = best.get(slug);
    if (!prev || (t && t > prev)) best.set(slug, t);
  }

  return Array.from(best.entries()).map(([slug, createdAt]) => ({
    slug,
    lastModified: createdAt ? new Date(createdAt) : undefined,
  }));
}
