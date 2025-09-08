"use client";

import { Smartphone, Sparkles, Handshake } from "lucide-react";

const professionalBenefits = [
  {
    icon: <Smartphone className="w-8 h-8 text-teal-500" />,
    title: "Sua Agenda no seu Bolso",
    description:
      "Acesse seus compromissos, detalhes dos clientes e horários de onde estiver. Total controle do seu dia na palma da sua mão.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-teal-500" />,
    title: "Foque no que Você Faz de Melhor",
    description:
      "Deixe que a plataforma cuide da marcação e do pagamento, para que você possa se dedicar 100% ao seu talento e ao seu cliente.",
  },
  {
    icon: <Handshake className="w-8 h-8 text-teal-500" />,
    title: "Conecte-se a Oportunidades",
    description:
      "Seja convidado para atuar nos melhores estabelecimentos ou gerencie sua própria carteira de clientes com facilidade e profissionalismo.",
  },
];

export const ProfessionalBenefits = () => (
  <section id="profissionais" className="py-20 bg-gray-100">
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
            className="bg-white p-8 rounded-xl shadow-md text-left"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-5">
              {benefit.icon}
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
