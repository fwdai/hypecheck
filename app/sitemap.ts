import type { MetadataRoute } from "next";
import { getSitemapHypeSlugs } from "@/lib/measure-store";

export const revalidate = 3600;

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const hypeEntries = await getSitemapHypeSlugs();
  const hypeRoutes: MetadataRoute.Sitemap = hypeEntries.map(
    ({ slug, lastModified }) => ({
      url: `${base}/hype/${encodeURIComponent(slug)}`,
      lastModified: lastModified ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...hypeRoutes];
}
