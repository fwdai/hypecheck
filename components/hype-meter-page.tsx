"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LandingView } from "@/components/LandingView";
import { AnalyzingView } from "@/components/AnalyzingView";
import { getVisitorSessionId } from "@/lib/visitor-session";
import type { AppState } from "@/types/hype";

interface HypeMeterPageProps {
  suggestions: string[];
}

export function HypeMeterPage({ suggestions }: HypeMeterPageProps) {
  const router = useRouter();
  const [state, setState] = useState<AppState>("landing");
  const [term, setTerm] = useState("");

  const handleMeasure = useCallback(
    async (searchTerm: string) => {
      setTerm(searchTerm);
      setState("analyzing");

      try {
        const res = await fetch("/api/measure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: searchTerm,
            visitorSessionId: getVisitorSessionId(),
          }),
        });

        const raw = await res.text();
        let data: unknown;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          throw new Error(
            res.ok
              ? "Invalid response from server."
              : "Analysis failed. Please try again.",
          );
        }

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

        if (
          typeof data === "object" &&
          data !== null &&
          "notAThing" in data &&
          (data as { notAThing: unknown }).notAThing === true
        ) {
          router.push(
            `/not-a-thing?q=${encodeURIComponent(searchTerm.trim())}`,
          );
          return;
        }

        if (
          typeof data !== "object" ||
          data === null ||
          !("slug" in data) ||
          typeof (data as { slug: unknown }).slug !== "string"
        ) {
          throw new Error("Invalid response from server.");
        }

        const slug = (data as { slug: string }).slug;
        router.push(`/hype/${encodeURIComponent(slug)}`);
      } catch (e: unknown) {
        console.error("Analysis failed:", e);
        const message =
          e instanceof Error ? e.message : "Analysis failed. Please try again.";
        toast.error(message);
        setState("landing");
      }
    },
    [router],
  );

  if (state === "analyzing") {
    return <AnalyzingView term={term} />;
  }

  return <LandingView suggestions={suggestions} onMeasure={handleMeasure} />;
}
