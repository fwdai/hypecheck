export type AppState = "landing" | "analyzing";

export interface Comparable {
  name: string;
  outcome: string;
}

export interface HypeAnalysis {
  hypeScore: number;
  verdict: string;
  realValuePercent: number;
  whatsReal: string[];
  whatsHype: string[];
  reasoning: string;
  maturityLevel: string;
  marketReadiness: string;
  stayingPower: string;
  lifecycleStage: string;
  timelinePrediction: string;
  hypDrivers: string[];
  comparables: Comparable[];
}
