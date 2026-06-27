import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "./providers";
import ChatBot from "@/components/layout/ChatBot";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "DaamCheck — Indian Food Bill Validator", template: "%s | DaamCheck" },
  description:
    "Check if your restaurant, IRCTC train food, or hotel bill follows Indian law. Service charge is banned. GST is capped at 5%. Free, no signup.",
  keywords: ["service charge India", "IRCTC price list", "GST restaurant", "consumer rights India"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Providers>
          <Nav />
          <main className="flex-1 pb-14 md:pb-0">{children}</main>
          <BottomNav />
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
