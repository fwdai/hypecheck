import { NextResponse } from "next/server";
import { isQueryAnalyzable } from "@/lib/ai/classify-query-analyzable";
import { getClientIp } from "@/lib/get-client-ip";
import { hashIp } from "@/lib/hash-ip";
import {
  createTerm,
  ensureCurrentWeekReportForTerm,
  findRecentReportForTerm,
  matchTermBySimilarity,
  recordQuery,
} from "@/lib/measure-store";
import { parseMeasureRequestBody } from "@/lib/measure-request-body";
import { normalizeQuery } from "@/lib/normalize-query";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseMeasureRequestBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const { term, visitorSessionId } = parsed;

  const userAgent = req.headers.get("user-agent");
  const clientIp = getClientIp(req);
  const ipHash = hashIp(clientIp);

  const match = await matchTermBySimilarity(term);

  if (!match) {
    const analyzable = await isQueryAnalyzable(term);
    if (!analyzable) {
      await recordQuery({
        rawQuery: term,
        normalizedQuery: normalizeQuery(term),
        visitorSessionId,
        userAgent,
        clientIp,
        ipHash,
        termId: null,
      });
      return NextResponse.json({ notAThing: true as const });
    }
  }

  const termRecord = match ?? (await createTerm(term));

  if (!termRecord) {
    return NextResponse.json(
      { error: "Could not resolve or create a canonical term." },
      { status: 500 },
    );
  }

  const logQuery = () =>
    recordQuery({
      rawQuery: term,
      normalizedQuery: normalizeQuery(term),
      visitorSessionId,
      userAgent,
      clientIp,
      ipHash,
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

  try {
    await ensureCurrentWeekReportForTerm({
      termId: termRecord.id,
      termName: termRecord.name,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Upstream model request failed.";
    console.error("[measure]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await logQuery();

  return NextResponse.json({
    slug: termRecord.slug,
    termName: termRecord.name,
  });
}
