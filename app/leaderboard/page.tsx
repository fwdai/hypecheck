import type { Metadata } from "next";
import { connection } from "next/server";
import { LeaderboardView } from "@/components/leaderboard-view";
import { getLeaderboardEntries } from "@/lib/data/leaderboard";

export const metadata: Metadata = {
  title: "This Week's Most Overhyped Tech | Hypecheck.fyi Leaderboard",
  description:
    "Ranked by pure hype score: the technologies generating the most noise with the least substance this week. Updated every Monday. No vendors. No sponsors. Just the data.",
};

export const revalidate = 30;

export default async function LeaderboardPage() {
  await connection();
  const entries = await getLeaderboardEntries();

  return <LeaderboardView entries={entries} />;
}
