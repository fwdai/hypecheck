"use client";

import { useRouter } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import type { HypeAnalysis } from "@/types/hype";

export function ResultsPageClient({
  term,
  data,
}: {
  term: string;
  data: HypeAnalysis;
}) {
  const router = useRouter();
  return (
    <ResultsView term={term} data={data} onReset={() => router.push("/")} />
  );
}
