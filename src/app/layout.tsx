import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VillainVault | Elite AI Poker Analysis & Opponent Database",
  description: "Dumbfound your opponents with Tier-1 AI player profiling, shorthand note parsing, and professional exploitative strategies. The definitive poker database for serious grinders.",
  keywords: ["poker analysis", "player profiling", "poker notes", "GTO", "exploitative strategy", "VillainVault"],
  authors: [{ name: "VillainVault Elite Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground min-h-screen relative`}
      >
        {/* Fixed background image */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bgpk.jpg')" }}
        />
        {/* Dark overlay for readability */}
        <div className="fixed inset-0 z-0 bg-black/80" />
        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
