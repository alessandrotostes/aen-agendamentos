// src/components/shared/TermsAndConditionsModal.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { termsContent, type ContentItem } from "@/lib/legalContent";

// Converte markdown simples em HTML
const markdownToHtml = (text: string) =>
  text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

const renderContent = (contentItem: ContentItem, index: number) => {
  if (typeof contentItem === "string") {
    const html = markdownToHtml(contentItem);
    return (
      <p
        key={index}
        className="text-gray-700 text-sm leading-relaxed mb-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (contentItem.type === "list") {
    return (
      <ul
        key={index}
        className="list-disc list-inside space-y-1 ml-4 mb-3 text-sm"
      >
        {contentItem.items.map((item, itemIndex) => {
          const html = markdownToHtml(item);
          return (
            <li
              key={itemIndex}
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </ul>
    );
  }

  if (contentItem.type === "bold") {
    return (
      <p
        key={index}
        className="text-gray-900 font-semibold text-sm mb-2 leading-relaxed"
      >
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "italic") {
    return (
      <p
        key={index}
        className="text-gray-600 italic text-sm mb-2 leading-relaxed"
      >
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "paragraph") {
    const className =
      contentItem.formatting === "bold"
        ? "text-gray-900 font-semibold text-sm mb-2 leading-relaxed"
        : contentItem.formatting === "italic"
        ? "text-gray-600 italic text-sm mb-2 leading-relaxed"
        : "text-gray-700 text-sm mb-2 leading-relaxed";
    return (
      <p key={index} className={className}>
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "highlight") {
    const highlightClasses = {
      important: "bg-red-50 border-l-4 border-red-400 p-3 mb-3 rounded-r-md",
      warning:
        "bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded-r-md",
      info: "bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r-md",
    };
    const textClasses = {
      important: "text-red-800 font-medium text-sm",
      warning: "text-yellow-800 font-medium text-sm",
      info: "text-blue-800 font-medium text-sm",
    };
    return (
      <div key={index} className={highlightClasses[contentItem.emphasis]}>
        <p className={textClasses[contentItem.emphasis]}>{contentItem.text}</p>
      </div>
    );
  }

  return null;
};

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {termsContent.title}
              </h2>
              <p className="text-sm text-gray-600">
                {termsContent.subtitle} - Última atualização:{" "}
                {termsContent.lastUpdated}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Ao utilizar a Plataforma, você concorda com estes Termos.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {termsContent.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-1">
                {section.title}
              </h3>
              {section.content &&
                section.content.map((item, i) => renderContent(item, i))}
              {section.subsections &&
                section.subsections.map((sub, si) => (
                  <div
                    key={si}
                    className="ml-3 space-y-4 border-l-2 border-gray-200 pl-3"
                  >
                    <h4 className="text-base font-semibold text-gray-800 mb-2">
                      {sub.subtitle}
                    </h4>
                    {sub.content.map((item, ci) => renderContent(item, ci))}
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="terms-checkbox"
              className="ml-3 text-sm text-gray-700"
            >
              Li e concordo com os{" "}
              <Link
                href="/legal/terms"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Termos e Condições
              </Link>{" "}
              e com a{" "}
              <Link
                href="/legal/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Política de Privacidade
              </Link>
              .
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsChecked(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!isChecked || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processando..." : "Confirmar e Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
