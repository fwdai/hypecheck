import { z } from "zod";

/** Must match lifecycle labels used in `ResultsView`. */
export const LIFECYCLE_STAGES = [
  "Innovation Trigger",
  "Peak of Inflated Expectations",
  "Trough of Disillusionment",
  "Slope of Enlightenment",
  "Plateau of Productivity",
] as const;

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
  lifecycleStage: z.enum(LIFECYCLE_STAGES),
  timelinePrediction: z.string().min(1),
  hypDrivers: z.array(z.string()).min(1),
  comparables: z.array(comparableSchema).min(1),
});

export type ParsedHypeAnalysis = z.infer<typeof hypeAnalysisSchema>;
