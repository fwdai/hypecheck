"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotAThingPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 dot-grid">
      <div className="max-w-lg w-full flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border/80 flex items-center justify-center">
            <HelpCircle
              className="w-7 h-7 text-muted-foreground"
              aria-hidden
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Probably not a thing
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We couldn&apos;t treat that as a single technology or product to
            score. Try a named framework, model, company, or tool — or check
            your spelling.
          </p>
          {q ? (
            <p className="text-sm font-mono text-muted-foreground/90 bg-muted/60 border border-border/60 rounded-xl px-4 py-3 w-full break-words">
              {q}
            </p>
          ) : null}
        </div>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "rounded-xl glow-pulse",
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden />
          Back to search
        </Link>
      </div>
    </div>
  );
}
