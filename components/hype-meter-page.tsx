"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LandingView } from "@/components/LandingView";
import { AnalyzingView } from "@/components/AnalyzingView";
import { ResultsView } from "@/components/ResultsView";
import { getVisitorSessionId } from "@/lib/visitor-session";
import type { AppState, HypeAnalysis } from "@/types/hype";

interface HypeMeterPageProps {
  suggestions: string[];
}

export function HypeMeterPage({ suggestions }: HypeMeterPageProps) {
  const [state, setState] = useState<AppState>("landing");
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<HypeAnalysis | null>(null);

  const handleMeasure = useCallback(async (searchTerm: string) => {
    setTerm(searchTerm);
    setState("analyzing");
    setResult(null);

    try {
      const res = await fetch("/api/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: searchTerm,
          visitorSessionId: getVisitorSessionId(),
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const err =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Analysis failed. Please try again.";
        throw new Error(err);
      }

      setResult(data as HypeAnalysis);
      setState("results");
    } catch (e: unknown) {
      console.error("Analysis failed:", e);
      const message =
        e instanceof Error ? e.message : "Analysis failed. Please try again.";
      toast.error(message);
      setState("landing");
    }
  }, []);

  const handleReset = () => {
    setState("landing");
    setTerm("");
    setResult(null);
  };

  if (state === "analyzing") {
    return <AnalyzingView term={term} />;
  }

  if (state === "results" && result) {
    return <ResultsView term={term} data={result} onReset={handleReset} />;
  }

  return <LandingView suggestions={suggestions} onMeasure={handleMeasure} />;
}
