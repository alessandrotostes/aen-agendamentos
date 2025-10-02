// src/app/page.tsx
"use client";

import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { ClientBenefits } from "@/components/landing/ClientBenefits";
import { OwnerBenefits } from "@/components/landing/OwnerBenefits";
import { ProfessionalBenefits } from "@/components/landing/ProfessionalBenefits";
import { CTASection } from "@/components/landing/CTASection";
import "./globals.css";

export default function HomePage() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <HeroSection />
        <AudienceSection />
        <OwnerBenefits />
        <ClientBenefits />
        <ProfessionalBenefits />
        <CTASection />
      </main>
    </div>
  );
}
