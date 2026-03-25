"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed top-4 right-4 z-50 h-10 w-10 shrink-0 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-50 h-10 w-10 shrink-0 rounded-full border-border/60 bg-card/80 shadow-sm backdrop-blur-sm hover:bg-accent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="h-[1.15rem] w-[1.15rem] text-primary" />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem] text-primary" />
      )}
    </Button>
  );
}
