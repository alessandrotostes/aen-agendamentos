// src/app/page.tsx
"use client";

import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ClientBenefits } from "@/components/landing/ClientBenefits";
import { OwnerBenefits } from "@/components/landing/OwnerBenefits";
import { ProfessionalBenefits } from "@/components/landing/ProfessionalBenefits";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import "./globals.css";

export default function HomePage() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <HeroSection />
        <ClientBenefits />
        <OwnerBenefits />
        <ProfessionalBenefits />
        <CTASection />
      </main>
    </div>
  );
}
