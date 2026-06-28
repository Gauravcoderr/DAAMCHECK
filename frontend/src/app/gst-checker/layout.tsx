import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GST & Service Charge Checker",
  description:
    "Check if the GST on your restaurant or hotel bill is correct. Instantly detect illegal service charge (banned since 2022) and GST overcharges. Know your rights under Indian consumer law.",
  keywords: [
    "GST restaurant checker India",
    "service charge calculator India",
    "hotel GST rate India",
    "restaurant bill GST",
    "CCPA service charge ban",
    "restaurant overcharge India",
    "GST 5 percent restaurant",
    "GST 18 percent hotel India",
  ],
  alternates: { canonical: "https://daamcheck.vercel.app/gst-checker" },
  openGraph: {
    title: "GST & Service Charge Checker — DaamCheck",
    description:
      "Is your restaurant adding illegal service charge? Is the GST wrong? Check instantly. Service charge banned since July 2022 under CCPA.",
    url: "https://daamcheck.vercel.app/gst-checker",
  },
  twitter: {
    title: "GST & Service Charge Checker — DaamCheck",
    description:
      "Service charge is banned in India since 2022. GST is capped at 5% for most restaurants. Check your bill now.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GST & Service Charge Checker",
  url: "https://daamcheck.vercel.app/gst-checker",
  applicationCategory: "UtilitiesApplication",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description:
    "Check if your restaurant or hotel bill GST is correct and detect illegal service charge under CCPA 2022.",
  featureList: ["GST overcharge detection", "Service charge violation check", "Hotel room rate GST bracket"],
};

export default function GSTCheckerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
