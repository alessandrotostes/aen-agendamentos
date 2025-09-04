"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  BarChart2,
} from "lucide-react";

// Componente para o selo de segurança do Mercado Pago, agora usando a imagem da pasta 'public'
const MercadoPagoBadge = () => (
  <div className="flex justify-center items-center gap-2 mt-8 border-t pt-6">
    <p className="text-xs text-gray-500">Pagamento seguro com</p>
    <Image
      src="/images/mercado-pago-logo.svg" // Caminho para a imagem
      alt="Logo do Mercado Pago"
      width={200}
      height={50}
    />
  </div>
);

// Lista de funcionalidades para a animação
const features = [
  {
    Icon: CalendarDays,
    title: "Agendamentos online automáticos",
    description:
      "Permita que seus clientes marquem horários 24/7, sem precisar de ligar, ou depender de respostas manuais.",
  },
  {
    Icon: CreditCard,
    title: "Pagamentos seguros integrados",
    description:
      "Receba pagamentos online com segurança através do Mercado Pago.",
  },
  {
    Icon: LayoutDashboard,
    title: "Dashboard completo de gestão",
    description:
      "Tenha uma visão completa dos seus agendamentos, serviços e equipe.",
  },
  {
    Icon: BarChart2,
    title: "Dashboard para profissionais do estabelecimento",
    description:
      "Profissionais que trabalham no seu estabelecimento terão acesso ao próprio dashboard, podendo acompanhar suas agendas individuais no dia a dia.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000); // Muda a cada 5 segundos
    return () => clearInterval(timer);
  }, []);

  const currentFeature = features[currentFeatureIndex];

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center animate-float">
                <span className="text-white font-bold text-xl">A&N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">All & None</h1>
                <p className="text-sm text-gray-500">Sistema de Agendamento</p>
              </div>
            </Link>
          </div>
          <div>{children}</div>
          <MercadoPagoBadge />
        </div>
      </div>

      {/* Lado Direito - Showcase de Funcionalidades */}
      <div className="hidden lg:block relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />

        <div
          className="absolute top-10 -left-10 w-48 h-48 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-10 -right-10 w-72 h-72 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-8">
              Gerencie seu negócio com facilidade
            </h2>

            <div className="relative h-48">
              <SwitchTransition>
                <CSSTransition
                  key={currentFeature.title}
                  nodeRef={nodeRef}
                  timeout={400}
                  classNames={{
                    enter: "opacity-0 transform -translate-y-4",
                    enterActive:
                      "opacity-100 transform translate-y-0 transition-all duration-300",
                    exit: "opacity-100 transform translate-y-0",
                    exitActive:
                      "opacity-0 transform translate-y-4 transition-all duration-300 absolute w-full",
                  }}
                >
                  <div ref={nodeRef} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <currentFeature.Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {currentFeature.title}
                      </h3>
                      <p className="mt-1 text-white text-opacity-80">
                        {currentFeature.description}
                      </p>
                    </div>
                  </div>
                </CSSTransition>
              </SwitchTransition>
            </div>

            <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
              <h4 className="font-bold text-lg">Por que All & None?</h4>
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <strong className="text-white">All:</strong> Todas as
                  ferramentas que você precisa para gerir e crescer o seu
                  negócio, na palma da sua mão.
                </p>
                <p>
                  <strong className="text-white">None:</strong> Nenhuma das
                  preocupações com agendamentos perdidos ou pagamentos
                  complicados. Nós cuidamos de tudo por você.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
