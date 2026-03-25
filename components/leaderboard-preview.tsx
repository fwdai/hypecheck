import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";

import type { LeaderboardPreviewEntry } from "@/lib/data/leaderboard";

interface LeaderboardPreviewProps {
  entries: LeaderboardPreviewEntry[];
}

export function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-lg animate-fade-up-delay-3">
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-hype" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Top hype this week
            </span>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <Link
              key={entry.id}
              href={`/hype/${encodeURIComponent(entry.slug)}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors group"
            >
              <span className="font-mono text-xs text-muted-foreground w-5 text-right">
                #{i + 1}
              </span>
              <span className="flex-1 text-sm text-foreground/80 group-hover:text-primary transition-colors truncate">
                {entry.term}
              </span>
              <span
                className={`font-mono text-sm font-bold ${
                  entry.hype_score >= 70
                    ? "text-hype"
                    : entry.hype_score >= 40
                      ? "text-hype-mid"
                      : "text-success"
                }`}
              >
                {entry.hype_score}%
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
