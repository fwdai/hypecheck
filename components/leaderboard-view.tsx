import Link from "next/link";
import { ArrowLeft, Flame, Trophy, Zap } from "lucide-react";

import type { LeaderboardEntry } from "@/lib/data/leaderboard";

function getRankStyle(rank: number) {
  if (rank === 0) return "text-yellow-400 border-yellow-400/30 bg-yellow-400/5";
  if (rank === 1) return "text-gray-300 border-gray-300/20 bg-gray-300/5";
  if (rank === 2) return "text-amber-600 border-amber-600/20 bg-amber-600/5";
  return "text-muted-foreground border-border/40";
}

function getRankIcon(rank: number) {
  if (rank < 3) return <Trophy className="w-5 h-5" />;
  return <span className="font-mono text-sm font-bold">#{rank + 1}</span>;
}

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardView({ entries }: LeaderboardViewProps) {
  return (
    <div className="min-h-screen px-4 py-12 dot-grid">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-between animate-fade-up">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
              Hypecheck.fyi
            </span>
          </div>
          <div className="w-16" />
        </div>

        <div className="text-center animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-6 h-6 text-hype" />
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Hype Leaderboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            This week&apos;s most overhyped tech, ranked by pure hype score.
            Updated every Monday.
          </p>
        </div>

        <div className="w-full space-y-2 animate-fade-up-delay-1">
          {entries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium mb-2">
                No analyses yet this week
              </p>
              <Link href="/" className="text-primary hover:underline text-sm">
                Be the first to measure something →
              </Link>
            </div>
          ) : (
            entries.map((entry, i) => (
              <Link
                key={entry.id}
                href={`/hype/${encodeURIComponent(entry.slug)}`}
                className={`w-full glass-panel rounded-xl p-4 flex items-center gap-4 border transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 cursor-pointer group ${getRankStyle(i)}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${getRankStyle(i)}`}
                >
                  {getRankIcon(i)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {entry.term}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.verdict}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`font-mono text-lg font-bold ${
                        entry.hype_score >= 70
                          ? "text-hype"
                          : entry.hype_score >= 40
                            ? "text-hype-mid"
                            : "text-success"
                      }`}
                    >
                      {entry.hype_score}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      hype
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <p className="text-muted-foreground/30 text-xs font-mono pb-8">
          Updated in real-time · Rankings refresh weekly
        </p>
      </div>
    </div>
  );
}
