import type { Metadata } from "next";
import { Suspense } from "react";
import { NotAThingPageClient } from "@/components/not-a-thing-page";

export const metadata: Metadata = {
  title: "Not a match — HypeCheck",
  description:
    "That search did not look like a single analyzable technology or product.",
  robots: { index: false, follow: true },
};

function NotAThingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 dot-grid">
      <p className="text-muted-foreground text-sm font-mono">Loading…</p>
    </div>
  );
}

export default function NotAThingPage() {
  return (
    <Suspense fallback={<NotAThingFallback />}>
      <NotAThingPageClient />
    </Suspense>
  );
}
