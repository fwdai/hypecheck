"use client";

import { Share2 } from "lucide-react";

interface ShareBlockProps {
  /** The text to share */
  text: string;
  /** The URL to share — defaults to current page */
  url?: string;
  /** Compact mode for inline placement */
  compact?: boolean;
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const socials = [
  {
    name: "X",
    icon: XIcon,
    color:
      "hover:text-foreground hover:border-foreground/30 hover:bg-foreground/5",
    getUrl: (text: string, url: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    icon: LinkedInIcon,
    color:
      "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5",
    getUrl: (_text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    icon: FacebookIcon,
    color:
      "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5",
    getUrl: (_text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    icon: RedditIcon,
    color:
      "hover:text-[#FF4500] hover:border-[#FF4500]/30 hover:bg-[#FF4500]/5",
    getUrl: (text: string, url: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
];

export function ShareBlock({ text, url, compact = false }: ShareBlockProps) {
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = (getUrl: (text: string, url: string) => string) => {
    window.open(
      getUrl(text, shareUrl),
      "_blank",
      "noopener,noreferrer,width=600,height=400",
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          Share
        </span>
        {socials.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => handleShare(s.getUrl)}
            title={`Share on ${s.name}`}
            className={`p-1.5 rounded-lg text-muted-foreground/60 border border-transparent transition-all duration-200 hover:scale-110 ${s.color}`}
          >
            <s.icon />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full relative group/share">
      <div className="absolute -inset-px rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl border border-primary/10" />
        <div className="absolute inset-0 shimmer-border opacity-0 group-hover/share:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 shimmer-border shimmer-auto" />
      </div>

      <div className="relative glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Spread the signal
            </p>
            <p className="text-xs text-muted-foreground">
              Help others cut through the noise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleShare(s.getUrl)}
              title={`Share on ${s.name}`}
              className={`group/btn relative p-2.5 rounded-xl text-muted-foreground border border-border/40 transition-all duration-200 hover:scale-110 active:scale-95 ${s.color}`}
            >
              <s.icon />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
