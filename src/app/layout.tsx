import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1C0FV92YFX" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1C0FV92YFX');`}
        </Script>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 pb-20">{children}</main>
        <footer className="border-t border-border py-6 text-center text-muted text-sm">
          <p>Powered by PaperHands Club</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="https://x.com/PHdotClub" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">𝕏</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
