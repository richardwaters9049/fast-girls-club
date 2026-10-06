import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/config";
import SiteDataPrefetch from "@/components/SiteDataPrefetch";
import AnalyticsConsent from "@/components/AnalyticsConsent";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fast Girls Club",
    template: "%s | Fast Girls Club",
  },
  description: "Motorsport stories, live Formula 1 data and racing culture with women front and centre.",
  openGraph: {
    type: "website",
    siteName: "Fast Girls Club",
    title: "Fast Girls Club",
    description: "Motorsport stories, live Formula 1 data and racing culture with women front and centre.",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript><style>{`main [style*="opacity:0"], main [style*="opacity: 0"] { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style></noscript>
        {children}
        <AnalyticsConsent />
        <SiteDataPrefetch />
      </body>
    </html>
  );
}
