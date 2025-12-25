'use client';

import {
  Header,
  Hero,
  TargetAudience,
  HowItWorks,
  WhatItMeasures,
  Features,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <TargetAudience />
        <HowItWorks />
        <WhatItMeasures />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
