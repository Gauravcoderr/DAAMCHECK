import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan Your Food Bill",
  description:
    "Upload a photo of your restaurant or train food bill. Our AI reads it and checks for illegal service charge, GST overcharges, and IRCTC price violations instantly.",
  keywords: [
    "scan restaurant bill India",
    "food bill checker online",
    "restaurant overcharge detector",
    "upload bill check GST",
    "IRCTC bill scanner",
    "consumer complaint India food",
    "restaurant service charge complaint",
    "food bill OCR India",
  ],
  alternates: { canonical: "https://daamcheck.vercel.app/scan-bill" },
  openGraph: {
    title: "Scan Your Food Bill — DaamCheck",
    description:
      "Upload a photo of your bill. Instant AI check for illegal service charge, GST overcharges, and IRCTC price violations.",
    url: "https://daamcheck.vercel.app/scan-bill",
  },
  twitter: {
    title: "Scan Your Food Bill — DaamCheck",
    description:
      "Upload your restaurant or train food bill photo. Instant check for service charge (illegal since 2022) and GST violations.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DaamCheck Bill Scanner",
  url: "https://daamcheck.vercel.app/scan-bill",
  applicationCategory: "UtilitiesApplication",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description:
    "Upload or manually enter your food bill items. Instantly check for illegal service charge and GST overcharges under Indian consumer law.",
  featureList: ["Photo bill upload", "Manual item entry", "IRCTC price cap check", "Service charge detection"],
};

export default function ScanBillLayout({ children }: { children: React.ReactNode }) {
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
