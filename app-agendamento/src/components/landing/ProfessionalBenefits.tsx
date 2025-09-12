"use client";

import React from "react"; // <--- CORREÇÃO AQUI
import { Smartphone, Sparkles, Handshake } from "lucide-react";

const professionalBenefits = [
  {
    icon: <Smartphone />,
    title: "Sua Agenda no seu Bolso",
    description:
      "Acesse seus compromissos, detalhes dos clientes e horários de onde estiver. Total controle do seu dia na palma da sua mão.",
  },
  {
    icon: <Sparkles />,
    title: "Foque no que Você Faz de Melhor",
    description:
      "Deixe que a plataforma cuide da marcação e do pagamento, para que você possa se dedicar 100% ao seu talento e ao seu cliente.",
  },
  {
    icon: <Handshake />,
    title: "Conecte-se a Oportunidades",
    description:
      "Seja convidado para atuar nos melhores estabelecimentos ou gerencie sua própria carteira de clientes com facilidade e profissionalismo.",
  },
];

export const ProfessionalBenefits = () => (
  <section id="profissionais" className="py-20 bg-slate-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900">
        Tudo para você, Profissional
      </h2>
      <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
        Mais tempo para você brilhar. Menos tempo se preocupando com a
        administração.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {professionalBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/60 text-left border border-transparent hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            {/* O FUNDO DO ÍCONE JÁ ESTAVA CORRETO */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-6 transition-all duration-300 group-hover:scale-110">
              {/* A COR DO ÍCONE JÁ ESTAVA CORRETA */}
              {React.cloneElement(benefit.icon, {
                className: "w-8 h-8 text-indigo-500",
              })}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {benefit.title}
            </h3>
            <p className="mt-2 text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
