import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { LiveTicker } from "@/components/shared/LiveTicker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentinelAI",
  description: "AI-Powered Traffic Enforcement Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col`}>
        <div className="flex-1">
          <Navbar />
          <main className="container mx-auto p-4">{children}</main>
        </div>
        <LiveTicker />
      </body>
    </html>
  );
}
