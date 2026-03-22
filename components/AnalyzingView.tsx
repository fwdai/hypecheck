"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Scanning industry signals",
  "Analyzing market adoption",
  "Detecting hype patterns",
  "Measuring real-world impact",
  "Calculating hype score",
];

interface AnalyzingViewProps {
  term: string;
}

export function AnalyzingView({ term }: AnalyzingViewProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i + 1), 600 * (i + 1)));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 dot-grid">
      <div className="flex flex-col items-center gap-10 max-w-md w-full">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse" />
          <div
            className="absolute inset-4 rounded-full border-2 border-primary/5 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="absolute inset-8 rounded-full border border-primary/5 animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider mb-1">
            Analyzing
          </p>
          <p className="text-2xl font-bold text-foreground">{term}</p>
        </div>

        <div className="w-full space-y-3">
          {STEPS.map((step, i) => {
            const isDone = activeStep > i;
            const isActive = activeStep === i;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  isDone
                    ? "bg-primary/5 border border-primary/10"
                    : isActive
                      ? "bg-muted/50 border border-border"
                      : "opacity-30"
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isDone ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step}
                  {isDone || isActive ? "..." : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
