"use client";

import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="hype-meter-theme"
    >
      {children}
      <ThemeToggle />
      <Toaster />
    </ThemeProvider>
  );
}
