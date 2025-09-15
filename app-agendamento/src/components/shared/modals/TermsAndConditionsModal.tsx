"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// ========================================================================
// ===== TIPOS E CONTEÚDO DOS TERMOS - FÁCIL DE EDITAR AQUI =====
// ========================================================================

// ALTERAÇÃO 1: Definir tipos específicos para o nosso conteúdo
type ContentItem = string | { type: "list"; items: string[] };

interface ContentSection {
  title: string;
  content?: ContentItem[];
  subsections?: {
    subtitle: string;
    content: ContentItem[];
  }[];
}

const termsContent: {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: ContentSection[];
} = {
  title: "TERMOS E CONDIÇÕES GERAIS DE USO",
  subtitle: "A&N AGENDAMENTOS",
  lastUpdated: "15 de setembro de 2025",
  sections: [
    {
      title: "INTRODUÇÃO",
      content: [
        "Bem-vindo à A&N Agendamentos, uma plataforma digital que conecta clientes a estabelecimentos e profissionais de diversos segmentos, facilitando o agendamento de serviços e processamento de pagamentos.",
        'A A&N Agendamentos é operada pela TS Desenvolvimentos, inscrita no CNPJ sob o nº 50.711.059/0001-66, com sede na Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583, doravante denominada "Plataforma".',
      ],
    },
    {
      title: "DEFINIÇÕES",
      content: [
        {
          type: "list",
          items: [
            "Plataforma: Serviços oferecidos via website e integrações.",
            "Cliente: Pessoa física que agenda serviços.",
            "Proprietário: Pessoa responsável por estabelecimento.",
            "Profissional: Pessoa habilitada a executar serviços.",
            "Usuário: Cliente, Proprietário ou Profissional.",
            "Estabelecimento: Local físico prestador de serviços.",
            "Serviços: Serviços oferecidos pelos Estabelecimentos.",
          ],
        },
      ],
    },
    {
      title: "1. ACEITAÇÃO DOS TERMOS",
      content: [
        "1.1. Uso da Plataforma implica aceitação integral destes Termos.",
        "1.2. Estes Termos complementam a Política de Privacidade.",
        "1.3. Cadastro permitido apenas a maiores de 18 anos ou menores com representação.",
        "1.4. A Plataforma pode alterar estes Termos, notificando Usuários 5 dias antes.",
      ],
    },
    {
      title: "2. DESCRIÇÃO DOS SERVIÇOS",
      content: [
        "2.1. A Plataforma intermedia agendamentos, oferecendo:",
        {
          type: "list",
          items: [
            "Busca e filtros",
            "Agendamento online",
            "Processamento de pagamentos via Mercado Pago",
            "Gestão de agendas",
            "Avaliações e favoritos",
            "Lembretes via Google Agenda",
          ],
        },
        "2.2. A Plataforma não executa serviços; é intermediadora.",
        "2.3. Pagamentos processados pelo Mercado Pago (cartões, PIX etc.).",
      ],
    },
    {
      title: "3. CADASTRO E CONTAS",
      content: [
        "3.1. Informações obrigatórias:",
        {
          type: "list",
          items: [
            "Clientes: nome, e-mail, telefone",
            "Proprietários: razão social, CNPJ, responsável, endereço",
            "Profissionais: nome, e-mail, telefone, comprovação de habilitação",
          ],
        },
        "3.2. Usuário responde pela veracidade dos dados.",
        "3.3. Conta única; múltiplas contas proibidas.",
        "3.4. Usuário mantém sigilo das credenciais.",
      ],
    },
    {
      title: "4. FUNCIONAMENTO",
      subsections: [
        {
          subtitle: "4.1. Cancelamento e Reembolso por Clientes",
          content: [
            "4.1.1. Busca e agendamento de horários.",
            "4.1.2. Pagamento obrigatório no agendamento com split entre Plataforma e Estabelecimento.",
            "4.1.3. Política de cancelamento:",
            {
              type: "list",
              items: [
                "Mais de 24h: reembolso 100%",
                "3h a 24h: reembolso 80%",
                "Menos de 3h: sem reembolso, salvo casos excepcionais",
              ],
            },
            "4.1.4. Reembolsos Automáticos: A Plataforma executa automaticamente o reembolso via Mercado Pago no ato do cancelamento, em até 24 horas, descontadas as retenções acima.",
          ],
        },
        {
          subtitle: "4.2. Cancelamento por Proprietários",
          content: [
            "4.2.1. Proprietário gerencia serviços e agenda.",
            "4.2.2. Conexão obrigatória com Mercado Pago.",
            "4.2.3. Comissão retida conforme acordo.",
            "4.2.4. Proprietário responsável pela qualidade dos serviços.",
            "4.2.5. Cancelamentos justificados geram estorno automático ao Cliente.",
            "4.2.6. Reembolsos Automáticos: A Plataforma solicita e executa reembolso via Mercado Pago em nome do Estabelecimento no ato do cancelamento, em até 24 horas.",
            "4.2.7. Descumprimento de provisão técnica (conta desconectada) coloca agendamento em status pending_refund; a Plataforma enforça reembolso manual seguindo fluxo de penalidades.",
          ],
        },
        {
          subtitle: "4.3. Para Profissionais",
          content: [
            "4.3.1. Acesso e gestão de agenda.",
            "4.3.2. Acesso limitado a dados necessários.",
            "4.3.3. Vínculo gerenciado pelo Proprietário.",
          ],
        },
      ],
    },
    {
      title: "5. PAGAMENTOS E REEMBOLSOS",
      content: [
        "5.1. Pagamentos processados pelo Mercado Pago.",
        "5.2. Split automático entre Estabelecimento e Plataforma.",
        "5.3. Reembolsos:",
        {
          type: "list",
          items: [
            "Executados automaticamente pela Plataforma via API Mercado Pago.",
            "Prazos: até 24h para transações simples, 5 dias úteis para casos com penalidades.",
            "Em falhas, status pending_refund e fluxo de penalidades disparado.",
          ],
        },
        "5.4. Penalidades: Falha em reembolso automático gera:",
        {
          type: "list",
          items: [
            "Suspensão de conta",
            "Multa de 10% sobre valor devido",
            "Retenção de futuros pagamentos",
          ],
        },
        "5.5. Disputas técnicas de pagamento são de responsabilidade do Mercado Pago.",
      ],
    },
    {
      title: "11. CONTATO",
      content: [
        "E-mail: aensuporte@gmail.com",
        "Telefone: (16) 99764-3604",
        "Endereço: Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
      ],
    },
  ],
};

interface TermsModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function TermsAndConditionsModal({
  isOpen,
  onConfirm,
  isLoading,
}: TermsModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  // ALTERAÇÃO 2: A função agora usa o tipo 'ContentItem' em vez de 'any'
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

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full flex flex-col h-[90vh]">
        <div className="flex items-center gap-3 flex-shrink-0">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800">
              {termsContent.title}
            </h3>
            <p className="text-xs text-slate-500">
              {termsContent.subtitle} - Última atualização:{" "}
              {termsContent.lastUpdated}
            </p>
          </div>
        </div>

        <div className="mt-4 flex-grow overflow-y-auto pr-4 -mr-4 prose prose-slate max-w-none select-none">
          {termsContent.sections.map((section, index) => (
            <div key={index}>
              <h2 className="!mb-2">{section.title}</h2>
              {section.content && section.content.map(renderContent)}
              {section.subsections &&
                section.subsections.map((sub, subIndex) => (
                  <div key={subIndex} className="ml-4">
                    <h3 className="!text-base !font-semibold !mt-4 !mb-2">
                      {sub.subtitle}
                    </h3>
                    {sub.content.map(renderContent)}
                  </div>
                ))}
            </div>
          ))}
          <p className="font-bold mt-8">
            Ao utilizar a Plataforma, você concorda com estes Termos.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t flex-shrink-0">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Declaro que li e concordo com os Termos e Condições de Uso e com a{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onConfirm}
              disabled={!isChecked || isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? "Salvando..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
