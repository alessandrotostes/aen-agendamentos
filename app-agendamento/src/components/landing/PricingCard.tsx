"use client";

import { BadgePercent } from "lucide-react";

export const PricingCard = () => {
  // --- Configuração do Link de Suporte ---
  const whatsappNumber = "5516997643604"; //

  const defaultMessage =
    "Olá, tenho dúvidas sobre a plataforma A&N Agendamentos, poderia me ajudar?";

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div className="mt-16 w-full max-w-4xl mx-auto">
      {/* Card Principal */}
      <div className="bg-gradient-to-br from-indigo-600 to-teal-600 text-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <BadgePercent className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold">
          E quanto custa tudo isso?
        </h3>
        <p className="text-6xl sm:text-7xl font-extrabold my-4 tracking-tight">
          2,99%
        </p>
        <p className="font-semibold text-indigo-200 text-lg">
          Por agendamento pago e confirmado.
        </p>
        <p className="mt-4 max-w-md mx-auto text-indigo-100">
          Sem mensalidade, sem taxa de adesão, sem pegadinhas. Você só paga
          quando um cliente te paga. Se não houver agendamentos, seu custo é
          zero.
        </p>

        {/* Aviso sobre taxas do processador de pagamento */}
        <p className="mt-6 text-xs text-indigo-200/80 max-w-sm mx-auto">
          *A taxa de 4,99% é a comissão da A&N. As taxas do Mercado Pago
          funcionam como as da sua maquininha de cartão, cobradas por eles à
          parte em cada transação.
        </p>

        {/* Botão de Ação (CTA) para o WhatsApp */}
        <div className="mt-8">
          <a
            href={whatsappLink}
            target="_blank" // Abre o link em uma nova aba
            rel="noopener noreferrer" // Medida de segurança para links externos
            className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Tirar dúvidas
          </a>
        </div>
      </div>
    </div>
  );
};
