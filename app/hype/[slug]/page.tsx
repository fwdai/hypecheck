import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultsPageClient } from "@/components/results-page-client";
import { getHypeReportBySlug } from "@/lib/measure-store";
import type { HypeAnalysis } from "@/types/hype";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getHypeReportBySlug(slug);
  if (!data) {
    return { title: "Not found — HypeCheck" };
  }
  return {
    title: `${data.termName}: ${data.analysis.hypeScore}% Hype — What's Real and What Isn't`,
    description: `${data.termName} is ${data.analysis.hypeScore}% hype according to our weekly analysis. ${data.analysis.verdict}. Updated weekly with real data.`,
  };
}

export default async function HypeSlugPage({ params }: Props) {
  const { slug } = await params;
  const data = await getHypeReportBySlug(slug);
  if (!data) notFound();

  return (
    <ResultsPageClient
      term={data.termName}
      data={data.analysis as HypeAnalysis}
      reportId={data.reportId}
      agrees={data.agrees}
      disagrees={data.disagrees}
    />
  );
}
