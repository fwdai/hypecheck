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
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono text-base font-semibold tracking-wider text-primary uppercase pt-0.5">
              HYPECHECK
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
            <label
              htmlFor="landing-search"
              className="relative glass-panel rounded-2xl flex items-center gap-3 px-6 py-5 min-h-[4.25rem] w-full cursor-text transition-[border-color,box-shadow] duration-200 group-focus-within:border-primary/35 group-focus-within:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
            >
              <Search
                className="w-6 h-6 text-muted-foreground shrink-0 pointer-events-none"
                aria-hidden
              />
              <Input
                id="landing-search"
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Enter any technology or concept..."
                className="h-auto min-h-0 flex-1 border-0 rounded-none bg-transparent px-0 py-0 text-lg sm:text-lg md:text-lg font-light shadow-none outline-none ring-0 placeholder:text-muted-foreground/55 focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none dark:bg-transparent disabled:bg-transparent disabled:opacity-100"
              />
              <Button
                type="submit"
                disabled={!term.trim()}
                size="lg"
                className="shrink-0 rounded-xl glow-pulse"
              >
                Check
              </Button>
            </label>
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
              className="rounded-full border-border/70 bg-muted text-secondary-foreground/90 hover:border-primary/40 hover:text-primary hover:bg-accent/45 dark:border-input/50 dark:bg-input/30 dark:text-secondary-foreground/80 dark:hover:border-primary/40 dark:hover:bg-input/50 dark:hover:text-primary"
            >
              {s}
            </Button>
          ))}
        </div>

        <p className="text-muted-foreground/40 text-xs font-mono animate-fade-up-delay-3 text-center">
          <div className="mb-4">Powered by AI · Not financial advice</div>
          <div>
            Assessed by the same technology being assessed. Make of that what
            you will.
          </div>
        </p>
        <p></p>
      </div>
    </div>
  );
}
