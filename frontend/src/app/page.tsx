import type { Metadata } from "next";
import Marquee from "@/components/layout/Marquee";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import Stats from "@/components/home/Stats";
import ToolCards from "@/components/home/ToolCards";
import HowItWorks from "@/components/home/HowItWorks";
import CtaBand from "@/components/home/CtaBand";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "DaamCheck — Free Indian Food Bill Checker",
  description:
    "Instantly verify if your restaurant or hotel bill is legal. Service charge banned since 2022. GST capped at 5% for restaurants. Check IRCTC train food prices too. Free, no signup.",
  alternates: { canonical: "https://daamcheck.vercel.app" },
  openGraph: {
    title: "DaamCheck — Free Indian Food Bill Checker",
    description:
      "Instantly verify if your restaurant or hotel bill is legal. Service charge banned since 2022. GST capped at 5%. Free, no signup.",
    url: "https://daamcheck.vercel.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://daamcheck.vercel.app/#website",
      url: "https://daamcheck.vercel.app",
      name: "DaamCheck",
      description: "Free Indian food bill validator — GST, IRCTC, and service charge checker",
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://daamcheck.vercel.app/irctc-prices?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://daamcheck.vercel.app/#organization",
      name: "DaamCheck",
      url: "https://daamcheck.vercel.app",
      description: "Consumer rights tool for Indian food bill verification",
    },
    {
      "@type": "WebApplication",
      "@id": "https://daamcheck.vercel.app/#webapp",
      name: "DaamCheck — Indian Food Bill Validator",
      url: "https://daamcheck.vercel.app",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description:
        "Check if your restaurant, hotel, or IRCTC train food bill is legal under Indian consumer law. Catch service charge violations and GST overcharges instantly.",
      featureList: [
        "GST overcharge detection",
        "Restaurant service charge checker",
        "IRCTC food price cap reference",
        "Photo bill scanner",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is service charge legal in restaurants in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Service charge in restaurants has been banned since July 2022 under CCPA Guidelines on Unfair Trade Practices. Restaurants cannot add service charge under any name.",
          },
        },
        {
          "@type": "Question",
          name: "What is the correct GST rate for restaurants in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "5% (without ITC) for standalone restaurants and hotel restaurants where the room rate is below ₹7,500/night. 18% (with ITC) applies only when the hotel room rate is ₹7,500 or above per night.",
          },
        },
        {
          "@type": "Question",
          name: "What are the maximum prices for IRCTC food on trains?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "IRCTC has fixed maximum prices per Railway Board circular: Tea ₹10, Coffee ₹15, Veg Thali ₹110, Non-Veg Thali ₹135, Mineral Water ₹15, among others. These are mandatory caps, not suggestions.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Marquee />
      <Hero />
      <TrustStrip />
      <Stats />
      <ToolCards />
      <HowItWorks />
      <CtaBand />
      <Footer />
    </>
  );
}
