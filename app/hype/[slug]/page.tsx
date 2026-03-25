import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { ResultsPageClient } from "@/components/results-page-client";
import { getHypeReportBySlug } from "@/lib/measure-store";
import type { HypeAnalysis } from "@/types/hype";

type Props = { params: Promise<{ slug: string }> };

// Merge with parent `openGraph`/`twitter` from root layout so OG and Twitter tags update.
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getHypeReportBySlug(slug);
  const resolvedParent = await parent;

  if (!data) {
    return { title: "Not found — Hypecheck.fyi" };
  }

  const title = `${data.termName}: ${data.analysis.hypeScore}% Hype — What's Real and What Isn't`;
  const description = `${data.termName} is ${data.analysis.hypeScore}% hype according to our weekly analysis. ${data.analysis.verdict}. Updated weekly with real data.`;

  return {
    title,
    description,
    openGraph: {
      ...resolvedParent.openGraph,
      title,
      description,
      url: `/hype/${slug}`,
    },
    twitter: {
      ...resolvedParent.twitter,
      title,
      description,
    },
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
