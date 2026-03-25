import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  ArrowLeft,
  Signal,
  ShieldOff,
  Target,
  Mail,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Hypecheck.fyi — How We Measure AI Hype vs Reality",
  description:
    "HypeCheck is an experiment in cutting through tech hype. We track real signals: developer activity, news coverage, search trends — to separate genuine value from LinkedIn fiction. Updated weekly.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen dot-grid">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 backdrop-blur-xl py-2">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
              HypeCheck
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* Hero */}
        <div className="mb-20 animate-fade-up">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-success via-hype-mid to-hype bg-clip-text text-transparent">
              HypeCheck
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            HypeCheck started as a simple question:{" "}
            <span className="text-foreground font-medium">
              how do you actually tell the difference between a technology that
              works and one that just has a great LinkedIn presence?
            </span>
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl leading-relaxed">
            We&apos;re still figuring that out — honestly. This is an experiment
            in measuring hype, and we&apos;re building it in public.
          </p>
        </div>

        {/* What We're Doing */}
        <div className="mb-16 animate-fade-up-delay-1">
          <div className="relative pl-8 border-l-2 border-success/30">
            <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-background border-2 border-success/50 flex items-center justify-center">
              <Signal className="w-4 h-4 text-success" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-4">
              What We&apos;re Doing
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-2xl">
              <p>
                Every week we pull signals from across the web for each
                technology we track:{" "}
                <span className="text-foreground/80">
                  search interest, developer activity, news coverage, community
                  sentiment.
                </span>{" "}
                And feed that data into an honest assessment of where reality
                sits relative to the claims being made.
              </p>

              <div className="flex flex-wrap gap-2 py-2">
                {[
                  "No vendor relationships",
                  "No sponsored rankings",
                  "No incentive to mislead",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-success/20 bg-success/5 text-success text-xs font-semibold font-mono"
                  >
                    <ShieldOff className="w-3 h-3" />
                    {item}
                  </span>
                ))}
              </div>

              <p>
                The scores aren&apos;t perfect. The methodology is evolving. But
                we think{" "}
                <span className="text-foreground font-medium">
                  an imperfect honest answer beats a polished one that&apos;s
                  trying to sell you something.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* What We're Not */}
        <div className="mb-16 animate-fade-up-delay-2">
          <div className="relative pl-8 border-l-2 border-hype-mid/30">
            <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-background border-2 border-hype-mid/50 flex items-center justify-center">
              <Target className="w-3 h-3 text-hype-mid" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-4">
              What We&apos;re Not
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed max-w-2xl">
              <p>
                We&apos;re not a data platform. We&apos;re not Gartner.
                We&apos;re not trying to be comprehensive or authoritative,{" "}
                <span className="text-foreground/80 font-mono text-sm">
                  yet
                </span>
                .
              </p>
              <p>
                We&apos;re a small tool trying to do one thing well:{" "}
                <span className="text-foreground font-medium">
                  cut through the noise so you can make better decisions about
                  what&apos;s actually worth your attention.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Get In Touch */}
        <div className="animate-fade-up-delay-3">
          <div className="glass-panel rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-hype/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-hype/10 border border-hype/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-hype" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  Get In Touch
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed max-w-2xl">
                <p>
                  Spotted something wrong? Have a technology you want us to
                  track? Have any ideas how we can improve?
                </p>
                <p className="text-foreground font-medium">
                  We especially want to hear the last one.
                </p>
                <a
                  href="mailto:hello@hypecheck.fyi"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-semibold hover:bg-primary/15 hover:border-primary/30 transition-all group"
                >
                  hello@hypecheck.fyi
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-muted-foreground/40 text-xs font-mono">
            Powered by AI analysis · Not financial advice · Built in public
          </p>
        </div>
      </div>
    </div>
  );
}
