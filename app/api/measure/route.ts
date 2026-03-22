import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  LIFECYCLE_STAGE_INDEX_HELP,
  llmHypeAnalysisSchema,
  parsedHypeAnalysisFromLlm,
  type ParsedHypeAnalysis,
} from "@/lib/hype-analysis-schema";
import { getClientIp } from "@/lib/get-client-ip";
import { hashIp } from "@/lib/hash-ip";
import {
  findCachedReport,
  recordQueryAndLink,
  upsertReportFromLlm,
} from "@/lib/measure-store";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { normalizeQuery } from "@/lib/normalize-query";

export const maxDuration = 60;

const TERM_MAX = 200;

const SYSTEM_PROMPT = `You are a concise technology analyst. Given a user-provided technology, product, or concept, assess how much is substantive "real value" versus marketing/social "hype".

Respond with a single JSON object only (no markdown, no prose outside JSON) using exactly these keys and types:
- hypeScore: number from 0-100 (higher = more hype, lower = more grounded)
- verdict: short punchy label (e.g. "Mostly substance", "Heavy on hype")
- realValuePercent: number 0-100 (share that is "real"; should roughly complement hype — they need not sum to exactly 100 but should be consistent)
- whatsReal: string array, 3-5 bullets of concrete facts, adoption, or technical merit
- whatsHype: string array, 3-5 bullets of overstated claims, buzz, or speculation
- reasoning: 2-4 sentences tying it together
- maturityLevel: short phrase (e.g. "Early research", "Production-ready niche")
- marketReadiness: short phrase
- stayingPower: short phrase (will it last vs fade)
- lifecycleStageIndex: integer 0-4 for Gartner-style hype cycle position (${LIFECYCLE_STAGE_INDEX_HELP})
- timelinePrediction: one sentence on how the narrative may evolve in ~1-3 years
- hypDrivers: string array of 3-6 actor types or forces driving hype (e.g. "VC marketing", "Tech Twitter")
- comparables: array of 2-4 objects { "name": string, "outcome": string } comparing to past tech cycles

Be opinionated but fair. If the term is ambiguous, state assumptions briefly inside reasoning.`;

async function generateWithOpenAI(
  openai: OpenAI,
  term: string,
  model: string,
): Promise<ParsedHypeAnalysis> {
  const completion = await openai.chat.completions.parse({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze and return JSON only for this term: ${JSON.stringify(term)}`,
      },
    ],
    response_format: zodResponseFormat(llmHypeAnalysisSchema, "hype_analysis"),
  });
  const message = completion.choices[0]?.message;
  if (message?.refusal) {
    throw new Error("Model refused to produce an analysis.");
  }
  if (!message?.parsed) {
    throw new Error("No parsed response from the model.");
  }
  return parsedHypeAnalysisFromLlm(message.parsed);
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Server misconfiguration: OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const term =
    typeof b.term === "string" ? b.term.trim() : "";

  const visitorSessionId =
    typeof b.visitorSessionId === "string" && b.visitorSessionId.length > 0
      ? b.visitorSessionId.slice(0, 128)
      : null;

  if (!term) {
    return NextResponse.json(
      { error: "Missing or empty \"term\" in request body." },
      { status: 400 },
    );
  }

  if (term.length > TERM_MAX) {
    return NextResponse.json(
      { error: `Term must be at most ${TERM_MAX} characters.` },
      { status: 400 },
    );
  }

  const normalizedKey = normalizeQuery(term);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const openai = new OpenAI({ apiKey: key });

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
    try {
      analysis = await generateWithOpenAI(openai, term, model);
    } catch (e: unknown) {
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
