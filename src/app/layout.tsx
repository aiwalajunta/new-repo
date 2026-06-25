import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { QueryProvider } from "@/components/layout/query-provider";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OfflineBanner } from "@/components/common/offline-banner";
import { APP_CONFIG } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`, template: `%s | ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_CONFIG.name },
  openGraph: { type: "website", locale: APP_CONFIG.locale, siteName: APP_CONFIG.name, title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`, description: APP_CONFIG.description },
};

export const viewport: Viewport = { themeColor: "#6B1D3A", width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-brand-ivory font-body antialiased">
        <QueryProvider>
          <Header />
          <OfflineBanner />
          <main className="mx-auto min-h-[calc(100vh-3.5rem-4rem)] max-w-7xl pb-20">{children}</main>
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}
