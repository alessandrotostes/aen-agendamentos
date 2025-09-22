"use client";

import React from "react";
// 1. IMPORTAR O NOVO ÍCONE
import { TrendingUp, BadgeDollarSign, Globe, BarChart3 } from "lucide-react";
import { PricingCard } from "./PricingCard";

// 2. ADICIONAR O NOVO BENEFÍCIO À LISTA
const ownerBenefits = [
  {
    icon: <TrendingUp />,
    title: "Otimize sua Agenda e Ganhos",
    description:
      "Diga adeus ao caderno de papel. Nossa agenda inteligente evita conflitos e maximiza sua ocupação, seja você uma clínica, um estúdio ou um salão.",
  },
  {
    icon: <BadgeDollarSign />,
    title: "Reduza Faltas com Pagamento Online",
    description:
      "Ao receber pagamentos antecipados via Mercado Pago, você garante o compromisso do cliente, diminui o 'não comparecimento' e protege seu faturamento.",
  },
  {
    icon: <Globe />,
    title: "Atraia Mais Clientes",
    description:
      "Ganhe uma página pública personalizada com URL amigável para divulgar seus serviços e ser encontrado por novos clientes na sua região.",
  },
  // --- NOVO CARTÃO ADICIONADO AQUI ---
  {
    icon: <BarChart3 />,
    title: "Decisões Baseadas em Dados",
    description:
      "Acesse relatórios completos de faturamento, serviços mais populares e horários de pico. Tome decisões inteligentes que impulsionam o crescimento do seu negócio.",
  },
  // ------------------------------------
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
      {/* 3. ATUALIZAR AS CLASSES DO GRID PARA 4 COLUNAS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {ownerBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-slate-50 p-8 rounded-2xl shadow-lg shadow-slate-200/60 text-left border border-transparent hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 mb-6 transition-all duration-300 group-hover:scale-110">
              {React.cloneElement(benefit.icon, {
                className: "w-8 h-8 text-purple-600",
              })}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {benefit.title}
            </h3>
            <p className="mt-2 text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>

      <PricingCard />
    </div>
  </section>
);
