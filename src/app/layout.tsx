import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/navigation/Header";
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
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
