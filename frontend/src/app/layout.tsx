import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurient - Turn Your Health Data Into IP Assets",
  description:
    "AI-powered wellness companion that transforms your health data into intellectual property on Story Protocol. Earn from AI companies licensing your anonymized health data.",
  keywords: [
    "health data",
    "IP assets",
    "Story Protocol",
    "AI wellness",
    "blockchain",
    "data licensing",
  ],
  authors: [{ name: "Aurient Team" }],
  openGraph: {
    title: "Aurient - Health Data as IP Assets",
    description:
      "Transform your health data into valuable IP assets on Story Protocol",
    type: "website",
  },
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aurient",
  },
  formatDetection: {
    telephone: false,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aurient" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <main>{children}</main>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
