import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CurrencyProvider from "@/components/CurrencyProvider";
import DeveloperMode from "@/components/DeveloperMode";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEKUR | Global Career Intelligence",
  description: "Clear, verified and actionable global career intelligence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="sekur-shell min-h-full flex flex-col">
        <CurrencyProvider>{children}<SiteFooter /><DeveloperMode /></CurrencyProvider>
      </body>
    </html>
  );
}
