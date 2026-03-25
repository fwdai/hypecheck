import { connection } from "next/server";
import { HypeMeterPage } from "@/components/hype-meter-page";
import { getLeaderboardPreviewEntries } from "@/lib/data/leaderboard";
import { getTopTrendingQueries } from "@/lib/measure-store";

export default async function Home() {
  await connection();
  const [suggestions, previewEntries] = await Promise.all([
    getTopTrendingQueries(10),
    getLeaderboardPreviewEntries(5),
  ]);

  return (
    <HypeMeterPage
      suggestions={suggestions}
      leaderboardEntries={previewEntries}
    />
  );
}
