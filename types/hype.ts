import type { HypeCategory } from "@/lib/hype-analysis-schema";

export type AppState = "landing" | "analyzing";

export interface Comparable {
  name: string;
  outcome: string;
}

export interface HypeAnalysis {
  term: string;
  whatIsReal: string;
  whatIsHype: string;
  hypeScore: number;
  verdict: string;
  realScore: number;
  realValuePercent: number;
  whatsReal: string[];
  whatsHype: string[];
  reasoning: string;
  maturityLevel: string;
  marketReadiness: string;
  stayingPower: string;
  lifecycleStage: string;
  timelinePrediction: string;
  timelineReality: string;
  linkedinVersion: string;
  realTakeaway: string;
  category: HypeCategory;
  hypeDrivers: string[];
  comparables: Comparable[];
}
