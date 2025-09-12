// src/components/shared/PasswordStrengthIndicator.tsx
"use client";

import { X, Check } from "lucide-react";
import React from "react";

interface PasswordStrengthProps {
  validation: {
    minLength: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

// Componente para um item da lista de critérios
const CriteriaItem = ({ isMet, text }: { isMet: boolean; text: string }) => (
  <li
    className={`flex items-center text-sm transition-colors ${
      isMet ? "text-emerald-600" : "text-slate-500"
    }`}
  >
    {isMet ? (
      <Check className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-500" />
    ) : (
      <X className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" />
    )}
    <span>{text}</span>
  </li>
);

export default function PasswordStrengthIndicator({
  validation,
}: PasswordStrengthProps) {
  return (
    <ul className="space-y-1.5 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <CriteriaItem
        isMet={validation.minLength}
        text="Mínimo de 8 caracteres"
      />
      <CriteriaItem
        isMet={validation.lowercase}
        text="Uma letra minúscula (a-z)"
      />
      <CriteriaItem
        isMet={validation.uppercase}
        text="Uma letra maiúscula (A-Z)"
      />
      <CriteriaItem isMet={validation.number} text="Um número (0-9)" />
      <CriteriaItem
        isMet={validation.specialChar}
        text="Um caractere especial (!@#...)"
      />
    </ul>
  );
}
