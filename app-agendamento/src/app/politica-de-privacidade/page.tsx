// src/app/politica-de-privacidade/page.tsx

import React from "react";
import LegalPageView from "@/components/shared/LegalPageView";
import { privacyPolicyContent } from "@/lib/legalContent";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageView
      content={privacyPolicyContent}
      backHref="/"
      backText="Voltar ao Início"
    />
  );
}
