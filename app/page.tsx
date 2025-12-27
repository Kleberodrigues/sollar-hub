'use client';

import {
  Header,
  Hero,
  TargetAudience,
  HowItWorks,
  WhatItMeasures,
  Features,
  Pricing,
  FAQ,
  CTA,
  Footer,
  WhatsAppButton,
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
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
