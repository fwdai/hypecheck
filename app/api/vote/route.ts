import { NextResponse } from "next/server";
import { castReportVote } from "@/lib/measure-store";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const reportId = typeof b.reportId === "string" ? b.reportId.trim() : "";
  const voteType = b.voteType === "agree" || b.voteType === "disagree" ? b.voteType : null;
  const visitorSessionId =
    typeof b.visitorSessionId === "string" && b.visitorSessionId.length > 0
      ? b.visitorSessionId.slice(0, 128)
      : null;

  if (!reportId || !UUID_RE.test(reportId)) {
    return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
  }
  if (!voteType) {
    return NextResponse.json({ error: "Invalid vote type." }, { status: 400 });
  }
  if (!visitorSessionId) {
    return NextResponse.json({ error: "Missing visitor session." }, { status: 400 });
  }

  const result = await castReportVote({
    reportId,
    voteType,
    visitorSessionId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    agrees: result.agrees,
    disagrees: result.disagrees,
    alreadyVoted: result.alreadyVoted,
    yourVote: result.yourVote,
  });
}
