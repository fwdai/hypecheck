import { z } from "zod";

/** Must match lifecycle labels used in `ResultsView`. */
export const LIFECYCLE_STAGES = [
  "Innovation Trigger",
  "Peak of Inflated Expectations",
  "Trough of Disillusionment",
  "Slope of Enlightenment",
  "Plateau of Productivity",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

/** Matches `CLAUDE_SYSTEM_PROMPT` category line. */
export const HYPE_CATEGORIES = [
  "Foundation Model",
  "Agent",
  "Tool",
  "Concept",
  "Company",
  "Buzzword",
  "Hardware",
] as const;

export type HypeCategory = (typeof HYPE_CATEGORIES)[number];

/** Maps LLM output (index) to UI labels. Order must match `LIFECYCLE_STAGES`. */
export const LIFECYCLE_STAGE_INDEX_HELP = LIFECYCLE_STAGES.map(
  (label, i) => `${i} = ${label}`,
).join("; ");

/**
 * Normalizes model- or cache-stored strings to canonical `LIFECYCLE_STAGES` values
 * (case, whitespace, and common Gartner wording variants).
 */
export function normalizeLifecycleStageString(
  raw: string,
): LifecycleStage | null {
  const s = raw.trim().replace(/\s+/g, " ");
  const lower = s.toLowerCase();

  for (const stage of LIFECYCLE_STAGES) {
    if (stage.toLowerCase() === lower) return stage;
  }

  const aliases: Record<string, LifecycleStage> = {
    "technology trigger": "Innovation Trigger",
    "inflated expectations": "Peak of Inflated Expectations",
  };
  const mapped = aliases[lower];
  if (mapped) return mapped;

  for (const stage of LIFECYCLE_STAGES) {
    if (lower.includes(stage.toLowerCase())) return stage;
  }

  return null;
}

const lifecycleStageField = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  return normalizeLifecycleStageString(val) ?? val.trim();
}, z.enum(LIFECYCLE_STAGES));

const comparableSchema = z.object({
  name: z.string(),
  outcome: z.string(),
});

const HYPE_DRIVERS_FALLBACK = "General market and media attention";

/** LLM sometimes returns [] or all-blank strings; coerce so validation and UI stay valid. */
const hypeDriversField = z.preprocess((val) => {
  if (typeof val === "string") {
    const s = val.trim();
    return s ? [s] : [HYPE_DRIVERS_FALLBACK];
  }
  if (Array.isArray(val)) {
    const arr = val.map((x) => String(x).trim()).filter(Boolean);
    return arr.length ? arr : [HYPE_DRIVERS_FALLBACK];
  }
  return val;
}, z.array(z.string()).min(1));

const lifecycleIndexField = z.preprocess((val) => {
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : val;
  }
  return val;
}, z.number().int().min(0).max(4));

/** App + DB payload (`reports.payload`). */
export const hypeAnalysisSchema = z.object({
  term: z.string().min(1),
  whatIsReal: z.string().min(1),
  whatIsHype: z.string().min(1),
  reasoning: z.string().min(1),
  maturityLevel: z.string().min(1),
  marketReadiness: z.string().min(1),
  stayingPower: z.string().min(1),
  lifecycleStage: lifecycleStageField,
  timelinePrediction: z.string().min(1),
  hypeDrivers: hypeDriversField,
  comparables: z.array(comparableSchema).min(1),
  verdict: z.string().min(1),
  timelineReality: z.string().min(1),
  linkedinVersion: z.string().min(1),
  realTakeaway: z.string().min(1),
  category: z.enum(HYPE_CATEGORIES),
  hypeScore: z.number().min(0).max(100),
  realScore: z.number().min(0).max(100),
  realValuePercent: z.number().min(0).max(100),
  whatsReal: z.array(z.string()).min(1),
  whatsHype: z.array(z.string()).min(1),
});

export type ParsedHypeAnalysis = z.infer<typeof hypeAnalysisSchema>;

/**
 * Raw JSON from the model (`CLAUDE_SYSTEM_PROMPT`): index instead of lifecycle label
 * and no derived list fields.
 */
export const llmHypeAnalysisSchema = z.object({
  term: z.string().min(1),
  whatIsReal: z.string().min(1),
  whatIsHype: z.string().min(1),
  reasoning: z.string().min(1),
  maturityLevel: z.string().min(1),
  marketReadiness: z.string().min(1),
  stayingPower: z.string().min(1),
  lifecycleStageIndex: lifecycleIndexField,
  timelinePrediction: z.string().min(1),
  hypeDrivers: hypeDriversField,
  comparables: z.array(comparableSchema).min(1),
  verdict: z.string().min(1),
  timelineReality: z.string().min(1),
  linkedinVersion: z.string().min(1),
  realTakeaway: z.string().min(1),
  category: z.enum(HYPE_CATEGORIES),
  hypeScore: z.number().min(0).max(100),
  realScore: z.number().min(0).max(100),
});

export type LlmHypeAnalysis = z.infer<typeof llmHypeAnalysisSchema>;

function stringToBulletList(text: string): string[] {
  const byNewline = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const bySentence = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (bySentence.length > 1) return bySentence;
  return [text.trim()];
}

export function parsedHypeAnalysisFromLlm(
  llm: LlmHypeAnalysis,
): ParsedHypeAnalysis {
  const whatsReal = stringToBulletList(llm.whatIsReal);
  const whatsHype = stringToBulletList(llm.whatIsHype);
  return {
    term: llm.term,
    whatIsReal: llm.whatIsReal,
    whatIsHype: llm.whatIsHype,
    reasoning: llm.reasoning,
    maturityLevel: llm.maturityLevel,
    marketReadiness: llm.marketReadiness,
    stayingPower: llm.stayingPower,
    lifecycleStage: LIFECYCLE_STAGES[llm.lifecycleStageIndex],
    timelinePrediction: llm.timelinePrediction,
    hypeDrivers: llm.hypeDrivers,
    comparables: llm.comparables,
    verdict: llm.verdict,
    timelineReality: llm.timelineReality,
    linkedinVersion: llm.linkedinVersion,
    realTakeaway: llm.realTakeaway,
    category: llm.category,
    hypeScore: llm.hypeScore,
    realScore: llm.realScore,
    realValuePercent: llm.realScore,
    whatsReal,
    whatsHype,
  };
}
