// src/app/termos-de-uso/page.tsx
import React from "react";
import LegalPageView from "@/components/shared/LegalPageView";
import { termsContent } from "@/lib/legalContent";

export default function TermosDeUsoPage() {
  return <LegalPageView content={termsContent} />;
}
