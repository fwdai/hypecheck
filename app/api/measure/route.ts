import { NextResponse } from "next/server";
import {
  generateHypeAnalysis,
  isOpenAiConfigured,
  OpenAiNotConfiguredError,
} from "@/lib/ai/generate-hype-analysis";
import type { ParsedHypeAnalysis } from "@/lib/hype-analysis-schema";
import { getClientIp } from "@/lib/get-client-ip";
import { hashIp } from "@/lib/hash-ip";
import {
  findCachedReport,
  recordQueryAndLink,
  upsertReportFromLlm,
} from "@/lib/measure-store";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { parseMeasureRequestBody } from "@/lib/measure-request-body";
import { normalizeQuery } from "@/lib/normalize-query";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "Server misconfiguration: OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  const parsed = await parseMeasureRequestBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const { term, visitorSessionId } = parsed;

  const normalizedKey = normalizeQuery(term);

  const userAgent = req.headers.get("user-agent");
  const clientIp = getClientIp(req);
  const ipHash = hashIp(clientIp);

  const cached = await findCachedReport(normalizedKey);
  let analysis: ParsedHypeAnalysis;
  let reportId: string | null = null;

  if (cached) {
    analysis = cached.analysis;
    reportId = cached.reportId;
  } else {
    let model: string;
    try {
      ({ analysis, model } = await generateHypeAnalysis(term));
    } catch (e: unknown) {
      if (e instanceof OpenAiNotConfiguredError) {
        return NextResponse.json({ error: e.message }, { status: 500 });
      }
      const message =
        e instanceof Error ? e.message : "Upstream model request failed.";
      console.error("[measure]", e);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    reportId = await upsertReportFromLlm({
      normalizedKey,
      analysis,
      model,
    });
  }

  const persistEnabled = isSupabaseServiceConfigured();
  if (!persistEnabled) {
    console.warn(
      "[measure] Supabase not configured: set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY. Apply migrations under supabase/migrations. Nothing is written to the database.",
    );
  } else if (!cached && !reportId) {
    console.error(
      "[measure] Report was not saved (upsert failed or returned no id). Check [measure-store] logs and that tables reports, queries, query_reports exist.",
    );
  }

  if (reportId) {
    await recordQueryAndLink({
      rawQuery: term,
      normalizedQuery: normalizedKey,
      visitorSessionId,
      userAgent,
      clientIp,
      ipHash,
      reportId,
    });
  }

  return NextResponse.json(analysis);
}
