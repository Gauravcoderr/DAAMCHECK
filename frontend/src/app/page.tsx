import Marquee from "@/components/layout/Marquee";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import Stats from "@/components/home/Stats";
import ToolCards from "@/components/home/ToolCards";
import HowItWorks from "@/components/home/HowItWorks";
import CtaBand from "@/components/home/CtaBand";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
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
