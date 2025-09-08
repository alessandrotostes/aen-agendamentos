"use client";

import { TrendingUp, BadgeDollarSign, Globe } from "lucide-react";
// 1. Importamos o novo componente de preço
import { PricingCard } from "./PricingCard";

const ownerBenefits = [
  {
    icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
    title: "Otimize sua Agenda e Ganhos",
    description:
      "Diga adeus ao caderno de papel. Nossa agenda inteligente evita conflitos e maximiza sua ocupação, seja você uma clínica, um estúdio ou um salão.",
  },
  {
    icon: <BadgeDollarSign className="w-8 h-8 text-indigo-500" />,
    title: "Reduza Faltas com Pagamento Online",
    description:
      "Ao receber pagamentos antecipados via Mercado Pago, você garante o compromisso do cliente, diminui o 'não comparecimento' e protege seu faturamento.",
  },
  {
    icon: <Globe className="w-8 h-8 text-indigo-500" />,
    title: "Atraia Mais Clientes",
    description:
      "Ganhe uma página pública personalizada com URL amigável para divulgar seus serviços e ser encontrado por novos clientes na sua região.",
  },
];

export const OwnerBenefits = () => (
  <section id="negocios" className="py-20 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900">
        Tudo para o seu Negócio
      </h2>
      <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
        Ferramentas poderosas para você gerenciar, crescer e simplificar a
        operação do seu estabelecimento.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {ownerBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-gray-50 p-8 rounded-xl shadow-md text-left border border-gray-100"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-5">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {benefit.title}
            </h3>
            <p className="mt-2 text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>

      {/* 2. Adicionamos o card de preço aqui no final da seção */}
      <PricingCard />
    </div>
  </section>
);
