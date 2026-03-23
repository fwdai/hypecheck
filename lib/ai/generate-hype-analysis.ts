import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  LIFECYCLE_STAGE_INDEX_HELP,
  llmHypeAnalysisSchema,
  parsedHypeAnalysisFromLlm,
  type ParsedHypeAnalysis,
} from "@/lib/hype-analysis-schema";

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export class OpenAiNotConfiguredError extends Error {
  constructor() {
    super("Server misconfiguration: OPENAI_API_KEY is not set.");
    this.name = "OpenAiNotConfiguredError";
  }
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getResolvedOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new OpenAiNotConfiguredError();
  }
  return new OpenAI({ apiKey });
}

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

export async function generateHypeAnalysis(
  term: string,
): Promise<{ analysis: ParsedHypeAnalysis; model: string }> {
  const model = getResolvedOpenAiModel();
  const openai = getOpenAiClient();

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
  const analysis = parsedHypeAnalysisFromLlm(message.parsed);
  return { analysis, model };
}
