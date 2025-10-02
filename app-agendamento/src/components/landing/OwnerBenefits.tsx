"use client";

import React from "react";
// 1. Importar todos os ícones que vamos usar
import {
  CalendarDays,
  CreditCard,
  Globe,
  BellRing,
  BarChart3,
  Users,
} from "lucide-react";
import { PricingCard } from "./PricingCard";

// 2. Criar a nova lista de funcionalidades chave
const features = [
  {
    icon: <CalendarDays />,
    title: "Agenda Inteligente",
    description:
      "Múltiplos profissionais, bloqueio de horários e visualização clara. Sua agenda, organizada e sem conflitos.",
  },
  {
    icon: <CreditCard />,
    title: "Pagamentos Online Seguros",
    description:
      "Reduza faltas com pagamentos antecipados via Mercado Pago. Garanta seu faturamento antes mesmo do serviço ser realizado.",
  },
  {
    icon: <Globe />,
    title: "Página de Agendamento Pública",
    description:
      "Atraia novos clientes com uma página online personalizada para o seu negócio, com link próprio para divulgar nas redes sociais.",
  },
  {
    icon: <BellRing />,
    title: "Lembretes: Google Agenda",
    description:
      "Diminua o 'não comparecimento' com lembretes automáticos enviados para seus clientes antes do horário marcado ao clicarem em adicionar ao Google Agenda.",
  },
  {
    icon: <BarChart3 />,
    title: "Relatórios e Análises",
    description:
      "Tome decisões baseadas em dados. Entenda seu faturamento, serviços mais rentáveis, horários de pico e desempenho da equipe.",
  },
  {
    icon: <Users />,
    title: "Gestão de Equipe",
    description:
      "Cadastre seus profissionais, defina os serviços que cada um oferece e convide-os para gerenciarem a própria agenda na plataforma.",
  },
];

export const OwnerBenefits = () => (
  // 3. Atualizar o título e a descrição da secção
  <section id="negocios" className="py-20 bg-slate-100">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900">
        Uma Plataforma Completa para Gerir e Crescer
      </h2>
      <p className="mt-2 text-lg text-gray-600 max-w-3xl mx-auto">
        Da agenda ao faturamento, oferecemos todas as ferramentas que o seu
        negócio precisa para otimizar o tempo e aumentar a receita.
      </p>
      {/* 4. Usar um grid responsivo para as novas funcionalidades */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-slate-50 p-8 rounded-2xl shadow-lg shadow-slate-200/60 text-left border border-transparent hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 mb-6 transition-all duration-300 group-hover:scale-110">
              {React.cloneElement(feature.icon, {
                className: "w-8 h-8 text-purple-600",
              })}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* O cartão de preços continua aqui, pois faz parte da oferta para o negócio */}
      <PricingCard />
    </div>
  </section>
);
