"use client";

import { useRouter } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import type { HypeAnalysis } from "@/types/hype";

export function ResultsPageClient({
  term,
  data,
  reportId,
  agrees,
  disagrees,
}: {
  term: string;
  data: HypeAnalysis;
  reportId: string;
  agrees: number;
  disagrees: number;
}) {
  const router = useRouter();
  return (
    <ResultsView
      term={term}
      data={data}
      reportId={reportId}
      agrees={agrees}
      disagrees={disagrees}
      onReset={() => router.push("/")}
    />
  );
}
