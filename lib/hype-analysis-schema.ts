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

/** Maps LLM output (index) to UI labels. Order must match `LIFECYCLE_STAGES`. */
export const LIFECYCLE_STAGE_INDEX_HELP = LIFECYCLE_STAGES.map(
  (label, i) => `${i} = ${label}`,
).join("; ");

/**
 * Normalizes model- or cache-stored strings to canonical `LIFECYCLE_STAGES` values
 * (case, whitespace, and common Gartner wording variants).
 */
export function normalizeLifecycleStageString(raw: string): LifecycleStage | null {
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

export const hypeAnalysisSchema = z.object({
  hypeScore: z.number().min(0).max(100),
  verdict: z.string().min(1),
  realValuePercent: z.number().min(0).max(100),
  whatsReal: z.array(z.string()).min(1),
  whatsHype: z.array(z.string()).min(1),
  reasoning: z.string().min(1),
  maturityLevel: z.string().min(1),
  marketReadiness: z.string().min(1),
  stayingPower: z.string().min(1),
  lifecycleStage: lifecycleStageField,
  timelinePrediction: z.string().min(1),
  hypDrivers: z.array(z.string()).min(1),
  comparables: z.array(comparableSchema).min(1),
});

export type ParsedHypeAnalysis = z.infer<typeof hypeAnalysisSchema>;

/**
 * Schema for the model: use a 0–4 index instead of long labels so structured output
 * stays reliable (no typos in multi-word strings).
 */
export const llmHypeAnalysisSchema = hypeAnalysisSchema.omit({
  lifecycleStage: true,
}).extend({
  lifecycleStageIndex: z.number().int().min(0).max(4),
});

export type LlmHypeAnalysis = z.infer<typeof llmHypeAnalysisSchema>;

export function parsedHypeAnalysisFromLlm(llm: LlmHypeAnalysis): ParsedHypeAnalysis {
  return {
    ...llm,
    lifecycleStage: LIFECYCLE_STAGES[llm.lifecycleStageIndex],
  };
}
