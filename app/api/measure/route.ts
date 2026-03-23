import { NextResponse } from "next/server";
import { generateHypeAnalysis } from "@/lib/ai/generate-hype-analysis";
import { getClientIp } from "@/lib/get-client-ip";
import { hashIp } from "@/lib/hash-ip";
import {
  createTerm,
  findRecentReportForTerm,
  matchTermBySimilarity,
  recordQuery,
  upsertReportFromLlm,
} from "@/lib/measure-store";
import { parseMeasureRequestBody } from "@/lib/measure-request-body";
import { normalizeQuery } from "@/lib/normalize-query";

export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = await parseMeasureRequestBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const { term, visitorSessionId } = parsed;

  const match = await matchTermBySimilarity(term);
  const termRecord = match ?? (await createTerm(term));

  if (!termRecord) {
    return NextResponse.json(
      { error: "Could not resolve or create a canonical term." },
      { status: 500 },
    );
  }

  const userAgent = req.headers.get("user-agent");
  const clientIp = getClientIp(req);
  const logQuery = () =>
    recordQuery({
      rawQuery: term,
      normalizedQuery: normalizeQuery(term),
      visitorSessionId,
      userAgent,
      clientIp,
      ipHash: hashIp(clientIp),
      termId: termRecord.id,
    });

  const cached = await findRecentReportForTerm(termRecord.id);
  if (cached) {
    await logQuery();
    return NextResponse.json({
      slug: termRecord.slug,
      termName: termRecord.name,
    });
  }

  let analysis;
  let model: string;
  try {
    ({ analysis, model } = await generateHypeAnalysis(termRecord.name));
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Upstream model request failed.";
    console.error("[measure]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await upsertReportFromLlm({
    termId: termRecord.id,
    analysis,
    model,
  });

  await logQuery();

  return NextResponse.json({
    slug: termRecord.slug,
    termName: termRecord.name,
  });
}
