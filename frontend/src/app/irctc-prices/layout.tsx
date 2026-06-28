import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRCTC Food Price List 2024",
  description:
    "Official IRCTC maximum food prices on Indian trains. Tea ₹10, Veg Thali ₹110, Non-Veg Thali ₹135. Know the Railway Board price caps — check if you were overcharged.",
  keywords: [
    "IRCTC food price list 2024",
    "IRCTC menu rates train India",
    "IRCTC maximum food price",
    "railway train food prices India",
    "IRCTC overcharge check",
    "train food price cap India",
    "IRCTC tea price",
    "IRCTC thali price",
  ],
  alternates: { canonical: "https://daamcheck.vercel.app/irctc-prices" },
  openGraph: {
    title: "IRCTC Food Price List 2024 — Official Railway Caps",
    description:
      "Official IRCTC maximum food prices per Railway Board circular. Tea ₹10, Veg Thali ₹110. Check if you paid more than the legal cap.",
    url: "https://daamcheck.vercel.app/irctc-prices",
  },
  twitter: {
    title: "IRCTC Food Price List 2024 — DaamCheck",
    description:
      "Official IRCTC maximum food prices on Indian trains. Tea ₹10, Veg Thali ₹110, Non-Veg Thali ₹135. Check if overcharged.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "IRCTC Official Food Price List 2024",
  description:
    "Maximum food prices on Indian Railway trains as per Railway Board circular. Covers meals, breakfast, beverages, and snacks.",
  url: "https://daamcheck.vercel.app/irctc-prices",
  creator: { "@type": "Organization", name: "DaamCheck" },
  about: { "@type": "Thing", name: "IRCTC food price caps — Indian Railways" },
  keywords: "IRCTC, food prices, Indian Railways, Railway Board, maximum prices",
};

export default function IRCTCPricesLayout({ children }: { children: React.ReactNode }) {
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
