import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { OpticksCollection } from "@/components/sections/OpticksCollection";
import { Philosophy } from "@/components/sections/Philosophy";
import { DawCompatibility } from "@/components/sections/DawCompatibility";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div id="collection" />
        <OpticksCollection />
        <Philosophy />
        <DawCompatibility />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
