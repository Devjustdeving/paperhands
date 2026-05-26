import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "PaperHands Club | Check How Jeet You Are",
  description: "Analyze any crypto wallet to see how much money was left on the table. Track paperhanded trades, roundtrips, and gains across Solana, Ethereum, and Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 pb-20">{children}</main>
        <footer className="border-t border-border py-6 text-center text-muted text-sm">
          <p>Powered by PaperHands Club</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="hover:text-foreground cursor-pointer transition-colors">𝕏</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Telegram</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Discord</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
