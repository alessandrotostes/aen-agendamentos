"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Alteração 1: Importar o conteúdo e os tipos do novo ficheiro centralizado
import { termsContent, type ContentItem } from "@/lib/legalContent";

interface TermsModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function TermsAndConditionsModal({
  isOpen,
  onConfirm,
  isLoading,
}: TermsModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  // Alteração 2: O objeto gigante com o texto dos termos foi REMOVIDO daqui.

  const renderContent = (contentItem: ContentItem, index: number) => {
    if (typeof contentItem === "string") {
      return <p key={index}>{contentItem}</p>;
    }
    if (contentItem.type === "list") {
      return (
        <ul key={index} className="list-disc list-inside space-y-2">
          {contentItem.items.map((li: string, liIndex: number) => (
            <li key={liIndex}>{li}</li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full flex flex-col h-[90vh]">
        <div className="flex items-center gap-3 flex-shrink-0">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800">
              {termsContent.title}
            </h3>
            <p className="text-xs text-slate-500">
              {termsContent.subtitle} - Última atualização:{" "}
              {termsContent.lastUpdated}
            </p>
          </div>
        </div>

        <div className="mt-4 flex-grow overflow-y-auto pr-4 -mr-4 prose prose-slate max-w-none select-none">
          {termsContent.sections.map((section, index) => (
            <div key={index}>
              <h2 className="!mb-2">{section.title}</h2>
              {section.content && section.content.map(renderContent)}
              {section.subsections &&
                section.subsections.map((sub, subIndex) => (
                  <div key={subIndex} className="ml-4">
                    <h3 className="!text-base !font-semibold !mt-4 !mb-2">
                      {sub.subtitle}
                    </h3>
                    {sub.content.map(renderContent)}
                  </div>
                ))}
            </div>
          ))}
          <p className="font-bold mt-8">
            Ao utilizar a Plataforma, você concorda com estes Termos.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t flex-shrink-0">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Declaro que li e concordo com os Termos e Condições de Uso e com a{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onConfirm}
              disabled={!isChecked || isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? "Salvando..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
