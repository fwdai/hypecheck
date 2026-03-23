"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { getVisitorSessionId } from "@/lib/visitor-session";

interface VoteBlockProps {
  reportId: string;
  initialAgrees?: number;
  initialDisagrees?: number;
}

export function VoteBlock({
  reportId,
  initialAgrees = 0,
  initialDisagrees = 0,
}: VoteBlockProps) {
  const [voted, setVoted] = useState<"agree" | "disagree" | null>(null);
  const [agrees, setAgrees] = useState(initialAgrees);
  const [disagrees, setDisagrees] = useState(initialDisagrees);

  const handleVote = async (type: "agree" | "disagree") => {
    if (voted || !reportId) return;

    const snapshot = { agrees, disagrees, voted };

    setVoted(type);
    if (type === "agree") {
      setAgrees((n) => n + 1);
    } else {
      setDisagrees((n) => n + 1);
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          voteType: type,
          visitorSessionId: getVisitorSessionId(),
        }),
      });

      const payload: unknown = await res.json();

      if (!res.ok) {
        const err =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Vote failed.";
        throw new Error(err);
      }

      const data = payload as {
        agrees: number;
        disagrees: number;
        alreadyVoted?: boolean;
        yourVote?: "agree" | "disagree";
      };

      setAgrees(data.agrees);
      setDisagrees(data.disagrees);
      setVoted(data.yourVote ?? type);
    } catch (e) {
      console.error("Vote failed:", e);
      setAgrees(snapshot.agrees);
      setDisagrees(snapshot.disagrees);
      setVoted(snapshot.voted);
    }
  };

  const total = agrees + disagrees;

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
        Do you agree?
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleVote("agree")}
          disabled={!!voted}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            voted === "agree"
              ? "bg-success/15 text-success border border-success/30"
              : voted
                ? "opacity-40 cursor-default text-muted-foreground"
                : "hover:bg-success/10 hover:text-success text-muted-foreground border border-transparent hover:border-success/20"
          }`}
        >
          <ThumbsUp
            className={`w-3.5 h-3.5 transition-transform ${!voted ? "group-hover:scale-110" : ""}`}
          />
          {total > 0 && <span>{agrees}</span>}
        </button>

        <button
          type="button"
          onClick={() => handleVote("disagree")}
          disabled={!!voted}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            voted === "disagree"
              ? "bg-hype/15 text-hype border border-hype/30"
              : voted
                ? "opacity-40 cursor-default text-muted-foreground"
                : "hover:bg-hype/10 hover:text-hype text-muted-foreground border border-transparent hover:border-hype/20"
          }`}
        >
          <ThumbsDown
            className={`w-3.5 h-3.5 transition-transform ${!voted ? "group-hover:scale-110" : ""}`}
          />
          {total > 0 && <span>{disagrees}</span>}
        </button>
      </div>
    </div>
  );
}
