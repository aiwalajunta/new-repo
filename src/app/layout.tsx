import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { QueryProvider } from "@/components/layout/query-provider";
import { APP_CONFIG } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`, template: `%s | ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_CONFIG.name },
};

export const viewport: Viewport = { themeColor: "#6B1D3A", width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="mobile-web-app-capable" content="yes" /></head>
      <body className="min-h-screen bg-brand-ivory font-body antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
