"use client";

import { useState } from "react";
import { HypeGauge } from "@/components/HypeGauge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";
import { LIFECYCLE_STAGES } from "@/lib/hype-analysis-schema";
import type { HypeAnalysis } from "@/types/hype";

interface ResultsViewProps {
  term: string;
  data: HypeAnalysis;
  onReset: () => void;
}

export function ResultsView({ term, data, onReset }: ResultsViewProps) {
  const [expanded, setExpanded] = useState(false);
  const hypePercent = 100 - data.realValuePercent;

  return (
    <div className="min-h-screen px-4 py-12 dot-grid">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-10">
        <div className="flex items-center gap-2 animate-fade-up">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
            HYPECHECK
          </span>
        </div>

        <div className="text-center animate-fade-up">
          <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider mb-2">
            Analysis for
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold">{term}</h2>
        </div>

        <div className="animate-fade-up-delay-1">
          <HypeGauge score={data.hypeScore} size={260} />
        </div>

        <div className="text-center animate-fade-up-delay-2 -mt-4">
          <div
            className={`inline-block px-5 py-2 rounded-full text-sm font-bold tracking-wide uppercase ${
              data.hypeScore <= 30
                ? "bg-success/10 text-success border border-success/20"
                : data.hypeScore <= 60
                  ? "bg-hype-mid/10 text-hype-mid border border-hype-mid/20"
                  : "bg-hype/10 text-hype border border-hype/20"
            }`}
          >
            {data.verdict}
          </div>
        </div>

        <div className="w-full max-w-md animate-fade-up-delay-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm font-bold text-success">
              {data.realValuePercent}% Real Value
            </span>
            <span className="font-mono text-sm font-bold text-hype">
              {hypePercent}% Hype
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-muted flex">
            <div
              className="h-full rounded-l-full transition-all duration-1000 ease-out"
              style={{
                width: `${data.realValuePercent}%`,
                background: `linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.7))`,
              }}
            />
            <div
              className="h-full rounded-r-full transition-all duration-1000 ease-out"
              style={{
                width: `${hypePercent}%`,
                background: `linear-gradient(90deg, hsl(var(--hype) / 0.7), hsl(var(--hype)))`,
              }}
            />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay-4">
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm font-bold text-success uppercase tracking-wider">
                What&apos;s Real
              </span>
            </div>
            <ul className="space-y-2.5">
              {data.whatsReal.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-secondary-foreground/90"
                >
                  <span className="text-success mt-0.5 shrink-0">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-hype" />
              <span className="text-sm font-bold text-hype uppercase tracking-wider">
                What&apos;s Hype
              </span>
            </div>
            <ul className="space-y-2.5">
              {data.whatsHype.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-secondary-foreground/90"
                >
                  <span className="text-hype mt-0.5 shrink-0">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full glass-panel rounded-2xl p-5 animate-fade-up-delay-5">
          <p className="text-sm leading-relaxed text-secondary-foreground/80">
            {data.reasoning}
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 animate-fade-up-delay-5">
          {[
            { label: "Maturity", value: data.maturityLevel, icon: TrendingUp },
            { label: "Market", value: data.marketReadiness, icon: Shield },
            { label: "Staying Power", value: data.stayingPower, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-panel rounded-xl p-4 text-center">
              <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
        >
          {expanded ? "Hide" : "View"} Full Analysis
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {expanded && (
          <div className="w-full space-y-6 animate-fade-up">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5">
                Hype Lifecycle Position
              </h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {LIFECYCLE_STAGES.map((stage, i) => {
                  const isActive = stage === data.lifecycleStage;
                  return (
                    <div key={stage} className="flex items-center shrink-0">
                      <div className="flex flex-col items-center gap-2 px-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            isActive
                              ? "bg-primary border-primary [box-shadow:0_0_12px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
                              : "border-border bg-muted"
                          }`}
                        />
                        <span
                          className={`text-[10px] text-center leading-tight max-w-[80px] ${
                            isActive
                              ? "text-primary font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                      {i < LIFECYCLE_STAGES.length - 1 && (
                        <div className="w-6 h-px bg-border shrink-0 -mt-5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Timeline Prediction
              </h3>
              <p className="text-foreground font-medium">
                {data.timelinePrediction}
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Who&apos;s Driving the Hype
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.hypDrivers.map((driver, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hype/5 border border-hype/10 text-sm text-hype"
                  >
                    <Users className="w-3 h-3" />
                    {driver}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Historical Comparisons
              </h3>
              <div className="space-y-3">
                {data.comparables.map((comp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {comp.name}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        — {comp.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={onReset}
          size="lg"
          className="rounded-xl glow-pulse"
        >
          <RotateCcw className="w-4 h-4" />
          Check Another
        </Button>

        <p className="text-muted-foreground/30 text-xs font-mono pb-8 text-center">
          <div className="mb-4">Powered by AI · Not financial advice</div>
          <div>
            Assessed by the same technology being assessed. Make of that what
            you will.
          </div>
        </p>
      </div>
    </div>
  );
}
