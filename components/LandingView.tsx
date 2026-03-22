"use client";

import { useState } from "react";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "AI Agents",
  "OpenClaw",
  "AGI",
  "Web3",
  "Quantum Computing",
  "MCP Servers",
  "Vibe Coding",
  "Rust",
];

interface LandingViewProps {
  onMeasure: (term: string) => void;
}

export function LandingView({ onMeasure }: LandingViewProps) {
  const [term, setTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) onMeasure(term.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 dot-grid">
      <div className="max-w-2xl w-full flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 animate-fade-up">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider text-primary uppercase">
              Hypometer
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center leading-tight tracking-tight">
            Is it{" "}
            <span className="bg-gradient-to-r from-success via-hype-mid to-hype bg-clip-text text-transparent">
              real
            </span>{" "}
            or just{" "}
            <span className="bg-gradient-to-r from-hype-mid to-hype bg-clip-text text-transparent">
              hype
            </span>
            ?
          </h1>
          <p className="text-muted-foreground text-lg text-center max-w-md">
            Measure the hype level of any technology or concept with AI-powered
            analysis.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg animate-fade-up-delay-1"
        >
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all duration-500" />
            <div className="relative glass-panel rounded-2xl flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Enter any technology or concept..."
                className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-lg font-light shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={!term.trim()}
                size="lg"
                className="shrink-0 rounded-xl glow-pulse"
              >
                Measure
              </Button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 animate-fade-up-delay-2">
          {SUGGESTIONS.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMeasure(s)}
              className="rounded-full border-border/60 text-secondary-foreground/80 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
            >
              {s}
            </Button>
          ))}
        </div>

        <p className="text-muted-foreground/40 text-xs font-mono animate-fade-up-delay-3">
          Powered by AI analysis · Not financial advice
        </p>
      </div>
    </div>
  );
}
