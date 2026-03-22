import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Hype Checker — Is It Real or Overhyped? | HypeCheck",
  description:
    "Type any AI technology and get an instant honest breakdown — hype score, what actually works, what's inflated, and a LinkedIn reality check. No BS.",
  keywords: [
    "AI hype checker",
    "AI reality check",
    "AI hype vs reality",
    "hype score AI",
    "is AI overhyped",
    "AI claims reality check",
    "LinkedIn AI hype detector",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
