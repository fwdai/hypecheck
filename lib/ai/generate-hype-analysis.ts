import Anthropic from "@anthropic-ai/sdk";
import {
  formatStatsSnapshotForPrompt,
  type HypeStatsSnapshot,
} from "@/lib/ai/stats-snapshot-prompt";
import {
  LIFECYCLE_STAGE_INDEX_HELP,
  llmHypeAnalysisSchema,
  parsedHypeAnalysisFromLlm,
  type ParsedHypeAnalysis,
} from "@/lib/hype-analysis-schema";

export class AnthropicNotConfiguredError extends Error {
  constructor() {
    super("Server misconfiguration: ANTHROPIC_API_KEY is not set.");
    this.name = "AnthropicNotConfiguredError";
  }
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function getResolvedAnthropicModel(): string {
  const model = process.env.ANTHROPIC_MODEL?.trim();
  if (!model) {
    throw new Error("Server misconfiguration: ANTHROPIC_MODEL is not set.");
  }
  return model;
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new AnthropicNotConfiguredError();
  }
  return new Anthropic({ apiKey });
}

export const CLAUDE_SYSTEM_PROMPT = `
You are a brutally honest AI analyst. Your job is to cut through hype and give clear-eyed assessments of AI technologies, tools, and terms.

When given a technology or AI term, respond ONLY with a raw JSON object. No preamble. No explanation. No markdown. No backticks. No code fences. Start your response with { and end with }. Use this exact structure (shape and key names must match; replace values with real content for the user's term):

{
  "term": "example term as understood",
  "whatIsReal": "Two or three sentences on what actually works today.",
  "whatIsHype": "Two or three sentences on what is inflated, misrepresented, or premature.",
  "reasoning": "Two to four sentences tying it together.",
  "maturityLevel": "Short phrase, e.g. Early research or Production-ready niche.",
  "marketReadiness": "Short phrase.",
  "stayingPower": "Short phrase: will it last vs fade.",
  "lifecycleStageIndex": 2,
  "timelinePrediction": "One sentence on how the narrative may evolve in roughly one to three years.",
  "hypeDrivers": ["VC marketing", "Tech Twitter", "Conference circuit", "Vendor blogs"],
  "comparables": [
    { "name": "Past tech A", "outcome": "What happened in that cycle" },
    { "name": "Past tech B", "outcome": "Another comparable outcome" }
  ],
  "verdict": "Mostly Hype",
  "timelineReality": "One or two sentences on when the hype might actually be justified, if ever.",
  "linkedinVersion": "A satirical one-liner parody of LinkedIn thought-leader speak.",
  "realTakeaway": "One sentence someone could use to make a decision.",
  "category": "Concept",
  "hypeScore": 72,
  "realScore": 28
}

Rules: lifecycleStageIndex must be an integer 0-4 (${LIFECYCLE_STAGE_INDEX_HELP}). hypeDrivers must be a JSON array of 3-6 non-empty strings (forces or actor types driving hype)—never an empty array. comparables must be a JSON array of 2-4 objects, each with name and outcome strings. category must be exactly one of: Foundation Model | Agent | Tool | Concept | Company | Buzzword | Hardware. verdict: max four words. realScore must equal 100 minus hypeScore. The JSON example above is illustrative; replace every value with real analysis for the user's term.

Be honest, specific, and slightly dry in tone. Use concrete examples and evidence. Don't hedge excessively. Base assessments on what's actually deployed and working versus what's being claimed.

When the user message includes a "STATS SNAPSHOT" section, treat those metrics as primary quantitative evidence. Explicitly reconcile them with qualitative judgment in reasoning (e.g. high search interest vs low open-source footprint suggests narrative ahead of engineering). If the snapshot is missing or empty, rely on general knowledge as before.`;

function extractAssistantText(
  content: Anthropic.Messages.Message["content"],
): string {
  const parts: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      parts.push(block.text);
    }
  }
  return parts.join("");
}

/** Parses a JSON object from model text, tolerating optional ```json fences and leading/trailing prose. */
function parseJsonObjectFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const body = fenced ? fenced[1].trim() : trimmed;
  const first = body.indexOf("{");
  const last = body.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Response did not contain a JSON object.");
  }
  return JSON.parse(body.slice(first, last + 1));
}

export async function generateHypeAnalysis(
  term: string,
  statsSnapshot: HypeStatsSnapshot = { googleTrends: null, github: null },
): Promise<{ analysis: ParsedHypeAnalysis; model: string }> {
  const model = getResolvedAnthropicModel();
  const client = getAnthropicClient();

  const statsBlock = formatStatsSnapshotForPrompt(statsSnapshot);
  const userBody = statsBlock
    ? `${statsBlock}Analyze and return JSON only for this term: ${JSON.stringify(term)}`
    : `Analyze and return JSON only for this term: ${JSON.stringify(term)}`;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: CLAUDE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userBody,
      },
    ],
  });

  const text = extractAssistantText(response.content);
  if (!text.trim()) {
    throw new Error("Empty response from the model.");
  }

  let raw: unknown;
  try {
    raw = parseJsonObjectFromModelText(text);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to parse model JSON: ${message}`);
  }

  const parsed = llmHypeAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Model output failed validation: ${parsed.error.message}`);
  }

  const analysis = parsedHypeAnalysisFromLlm(parsed.data);
  return { analysis, model };
}
