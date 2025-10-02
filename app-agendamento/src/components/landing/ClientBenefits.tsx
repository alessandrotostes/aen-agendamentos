"use client";

import React from "react"; // <--- CORREÇÃO AQUI
import { Calendar, CreditCard, Search } from "lucide-react";

const clientBenefits = [
  {
    icon: <Search />,
    title: "Encontre os Melhores Profissionais",
    description:
      "Busque por qualquer tipo de serviço e descubra especialistas perto de você.",
  },
  {
    icon: <Calendar />,
    title: "Agende a Qualquer Hora",
    description:
      "Chega de esperar pelo horário no local. Reserve seu horário online, 24 horas por dia, 7 dias por semana, e chegue na hora do seu compromisso.",
  },
  {
    icon: <CreditCard />,
    title: "Pagamento Fácil e Seguro",
    description:
      "Garanta seu horário pagando online com a segurança do Mercado Pago. Simples, rápido e totalmente confiável.",
  },
];

export const ClientBenefits = () => (
  <section id="clientes" className="py-20 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900">
        Tudo para você, Cliente
      </h2>
      <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
        Simplificamos a forma como você acessa os serviços que precisa, quando
        precisa.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {clientBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/60 text-left border border-transparent hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            {/* ALTERAÇÃO NA COR DE FUNDO DO ÍCONE */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 mb-6 transition-all duration-300 group-hover:scale-110">
              {/* ALTERAÇÃO NA COR DO ÍCONE */}
              {React.cloneElement(benefit.icon, {
                className: "w-8 h-8 text-teal-600",
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
