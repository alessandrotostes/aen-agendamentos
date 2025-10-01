// src/components/shared/LegalPageView.tsx
import React from "react";
import type { LegalContent, ContentItem } from "@/lib/legalContent";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        className="text-gray-700 leading-relaxed mb-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (contentItem.type === "list") {
    return (
      <ul key={index} className="list-disc list-inside space-y-2 ml-6 mb-4">
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
        className="text-gray-900 font-semibold mb-3 leading-relaxed"
      >
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "italic") {
    return (
      <p key={index} className="text-gray-600 italic mb-3 leading-relaxed">
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "paragraph") {
    const className =
      contentItem.formatting === "bold"
        ? "text-gray-900 font-semibold mb-3 leading-relaxed"
        : contentItem.formatting === "italic"
        ? "text-gray-600 italic mb-3 leading-relaxed"
        : "text-gray-700 mb-3 leading-relaxed";
    return (
      <p key={index} className={className}>
        {contentItem.text}
      </p>
    );
  }

  if (contentItem.type === "highlight") {
    const highlightClasses = {
      important: "bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg",
      warning:
        "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg",
      info: "bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg",
    };
    const textClasses = {
      important: "text-red-800 font-medium",
      warning: "text-yellow-800 font-medium",
      info: "text-blue-800 font-medium",
    };
    return (
      <div key={index} className={highlightClasses[contentItem.emphasis]}>
        <p className={textClasses[contentItem.emphasis]}>{contentItem.text}</p>
      </div>
    );
  }

  return null;
};

interface LegalPageViewProps {
  content: LegalContent;
  backHref?: string;
  backText?: string;
}

export default function LegalPageView({
  content,
  backHref = "/",
  backText = "Voltar ao Início",
}: LegalPageViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backText}
          </Link>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {content.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {content.subtitle} - Última atualização: {content.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            {content.sections.map((section, sectionIndex) => (
              <section
                key={sectionIndex}
                className="border-b border-gray-100 last:border-b-0 pb-8 last:pb-0"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-100">
                  {section.title}
                </h2>
                {section.content && (
                  <div className="space-y-2">
                    {section.content.map((item, idx) =>
                      renderContent(item, idx)
                    )}
                  </div>
                )}
                {section.subsections && (
                  <div className="mt-6 space-y-6">
                    {section.subsections.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        className="ml-4 pl-4 border-l-2 border-gray-200"
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          {sub.subtitle}
                        </h3>
                        <div className="space-y-2">
                          {sub.content.map((item, idx2) =>
                            renderContent(item, idx2)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
