import { NextResponse } from "next/server";

const TERM_MAX = 60;

export type ParsedMeasureBody =
  | { ok: true; term: string; visitorSessionId: string | null }
  | { ok: false; response: NextResponse };

export async function parseMeasureRequestBody(
  req: Request,
): Promise<ParsedMeasureBody> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      ),
    };
  }

  const b =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const term = typeof b.term === "string" ? b.term.trim() : "";

  const visitorSessionId =
    typeof b.visitorSessionId === "string" && b.visitorSessionId.length > 0
      ? b.visitorSessionId.slice(0, 128)
      : null;

  if (!term) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing or empty "term" in request body.' },
        { status: 400 },
      ),
    };
  }

  if (term.length > TERM_MAX) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Term must be at most ${TERM_MAX} characters.` },
        { status: 400 },
      ),
    };
  }

  return { ok: true, term, visitorSessionId };
}
