import { hypeAnalysisSchema, type ParsedHypeAnalysis } from "@/lib/hype-analysis-schema";
import {
  getServiceSupabase,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
export async function getTopTrendingQueries(
  limit = 10,
): Promise<string[]> {
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

export async function findCachedReport(
  normalizedKey: string,
): Promise<{ reportId: string; analysis: ParsedHypeAnalysis } | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = getServiceSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("reports")
    .select("id, payload")
    .eq("normalized_key", normalizedKey)
    .gt("expires_at", now)
    .maybeSingle();

  if (error) {
    console.error(
      "[measure-store] findCachedReport",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return null;
  }
  if (!data?.payload) return null;

  const parsed = hypeAnalysisSchema.safeParse(data.payload);
  if (!parsed.success) {
    console.error("[measure-store] cached payload invalid", parsed.error);
    return null;
  }

  return { reportId: data.id, analysis: parsed.data };
}

export async function upsertReportFromLlm(params: {
  normalizedKey: string;
  analysis: ParsedHypeAnalysis;
  model: string;
}): Promise<string | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = getServiceSupabase();
  const expiresAt = new Date(Date.now() + WEEK_MS).toISOString();
  const refreshedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("reports")
    .upsert(
      {
        normalized_key: params.normalizedKey,
        payload: params.analysis,
        model: params.model,
        expires_at: expiresAt,
        refreshed_at: refreshedAt,
      },
      { onConflict: "normalized_key" },
    )
    .select("id")
    .single();

  if (error) {
    console.error(
      "[measure-store] upsertReportFromLlm",
      error.message,
      error.details ?? "",
      error.hint ?? "",
    );
    return null;
  }
  return data?.id ?? null;
}

export async function recordQueryAndLink(params: {
  rawQuery: string;
  normalizedQuery: string;
  visitorSessionId: string | null;
  userAgent: string | null;
  /** Resolved client IP (IPv4/IPv6 string); stored in `queries.ip`. */
  clientIp: string | null;
  ipHash: string | null;
  reportId: string;
}): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;

  const supabase = getServiceSupabase();

  const { data: inserted, error: e1 } = await supabase
    .from("queries")
    .insert({
      raw_query: params.rawQuery,
      normalized_query: params.normalizedQuery,
      visitor_session_id: params.visitorSessionId,
      user_agent: params.userAgent,
      ip: params.clientIp,
      ip_hash: params.ipHash,
    })
    .select("id")
    .single();

  if (e1 || !inserted) {
    console.error(
      "[measure-store] insert queries",
      e1?.message,
      e1?.details ?? "",
      e1?.hint ?? "",
    );
    return;
  }

  const { error: e2 } = await supabase.from("query_reports").insert({
    query_id: inserted.id,
    report_id: params.reportId,
  });

  if (e2) {
    console.error(
      "[measure-store] insert query_reports",
      e2.message,
      e2.details ?? "",
      e2.hint ?? "",
    );
  }
}
