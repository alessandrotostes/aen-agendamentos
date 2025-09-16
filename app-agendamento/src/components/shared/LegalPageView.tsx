// src/components/shared/LegalPageView.tsx
import React from "react";
import type {
  LegalContent,
  ContentSection,
  ContentItem,
} from "@/lib/legalContent";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Função para renderizar o conteúdo (listas ou parágrafos)
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

// O componente principal da página
export default function LegalPageView({ content }: { content: LegalContent }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a página inicial
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <ShieldCheck className="w-10 h-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {content.title}
            </h1>
            <p className="text-sm text-slate-500">
              {content.subtitle} - Última atualização: {content.lastUpdated}
            </p>
          </div>
        </div>

        <article className="mt-8 prose prose-slate max-w-none">
          {content.sections.map((section, index) => (
            <div key={index}>
              <h2>{section.title}</h2>
              {section.content && section.content.map(renderContent)}
              {section.subsections &&
                section.subsections.map((sub, subIndex) => (
                  <div key={subIndex} className="ml-4">
                    <h3 className="!text-lg !font-semibold !mt-6 !mb-2">
                      {sub.subtitle}
                    </h3>
                    {sub.content.map(renderContent)}
                  </div>
                ))}
            </div>
          ))}
        </article>
      </div>
    </div>
  );
}
