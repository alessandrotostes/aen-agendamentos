// src/lib/legalContent.ts
export type ContentItem = string | { type: "list"; items: string[] };
export interface ContentSection {
  title: string;
  content?: ContentItem[];
  subsections?: {
    subtitle: string;
    content: ContentItem[];
  }[];
}
export interface LegalContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: ContentSection[];
}

// ========================================================================
// ===== CONTEÚDO DOS TERMOS E CONDIÇÕES =====
// ========================================================================
export const termsContent: LegalContent = {
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
        "E-mail: suporte@aenagendamentos.com.br",
        "Telefone: (16) 99764-3604",
        "Endereço: Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
      ],
    },
  ],
};

// ========================================================================
// ===== CONTEÚDO DA POLÍTICA DE PRIVACIDADE =====
// ========================================================================
export const privacyPolicyContent: LegalContent = {
  title: "POLÍTICA DE PRIVACIDADE",
  subtitle: "A&N AGENDAMENTOS",
  lastUpdated: "15 de setembro de 2025",
  sections: [
    {
      title: "INTRODUÇÃO",
      content: [
        "A A&N Agendamentos valoriza e respeita a privacidade de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), o Marco Civil da Internet (Lei 12.965/2014) e demais regulamentações aplicáveis.",
        "Esta Política integra os Termos e Condições Gerais de Uso e se aplica a todos os usuários da plataforma A&N Agendamentos, incluindo website, aplicativos móveis e integrações.",
      ],
    },
    {
      title: "1. IDENTIFICAÇÃO DO CONTROLADOR",
      content: [
        "Controlador dos Dados:",
        {
          type: "list",
          items: [
            "Razão Social: TS Desenvolvimentos",
            "CNPJ: 50.711.059/0001-66",
            "Endereço: Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
            "E-mail para questões de privacidade: suporte@anagendamentos.com.br",
          ],
        },
      ],
    },
    {
      title: "2. DADOS PESSOAIS COLETADOS",
      subsections: [
        {
          subtitle: "2.1 DADOS DE CLIENTES",
          content: [
            "Dados de Cadastro:",
            {
              type: "list",
              items: [
                "Nome completo",
                "Endereço de e-mail",
                "Número de telefone",
                "Data de nascimento (quando fornecida)",
              ],
            },
            "Dados de Navegação:",
            {
              type: "list",
              items: [
                "Endereço IP",
                "Tipo de dispositivo e navegador",
                "Páginas visitadas na plataforma",
                "Horários de acesso",
                "Localização aproximada (através de IP)",
              ],
            },
            "Dados de Agendamento:",
            {
              type: "list",
              items: [
                "Histórico de agendamentos",
                "Preferências de serviços",
                "Avaliações e comentários",
                "Estabelecimentos favoritados",
              ],
            },
          ],
        },
        {
          subtitle: "2.2 DADOS DE PROPRIETÁRIOS DE ESTABELECIMENTOS",
          content: [
            "Dados de Cadastro:",
            {
              type: "list",
              items: [
                "Razão social ou nome completo",
                "CNPJ",
                "Endereço comercial completo",
                "Telefone de contato",
                "Endereço de e-mail",
                "Dados do responsável legal",
              ],
            },
            "Dados Operacionais:",
            {
              type: "list",
              items: [
                "Informações sobre serviços oferecidos",
                "Preços e disponibilidade",
                "Horários de funcionamento",
                "Agenda de agendamentos",
                "Dados financeiros para recebimento (via Mercado Pago)",
              ],
            },
          ],
        },
        {
          subtitle: "2.3 DADOS DE PROFISSIONAIS",
          content: [
            "Dados de Cadastro:",
            {
              type: "list",
              items: [
                "Nome completo",
                "CPF",
                "Telefone de contato",
                "E-mail (quando fornecido)",
                "Comprovação de habilitação profissional",
              ],
            },
            "Dados Operacionais:",
            {
              type: "list",
              items: [
                "Agenda de atendimentos",
                "Disponibilidade de horários",
                "Vínculo com estabelecimentos",
              ],
            },
          ],
        },
        {
          subtitle: "2.4 DADOS TÉCNICOS",
          content: [
            "Coletados Automaticamente:",
            {
              type: "list",
              items: [
                "Logs de acesso e uso da plataforma",
                "Informações de dispositivos e navegadores",
                "Cookies e tecnologias similares",
                "Dados de performance e erros da aplicação",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "3. FINALIDADES DO TRATAMENTO",
      subsections: [
        {
          subtitle: "3.1 FINALIDADES PRINCIPAIS",
          content: [
            "Para operação da plataforma:",
            {
              type: "list",
              items: [
                "Criar e gerenciar contas de usuários",
                "Facilitar o agendamento de serviços",
                "Processar pagamentos através do Mercado Pago",
                "Enviar notificações e lembretes de agendamento",
                "Fornecer suporte ao cliente",
              ],
            },
            "Para melhoria dos serviços:",
            {
              type: "list",
              items: [
                "Analisar padrões de uso da plataforma",
                "Personalizar a experiência do usuário",
                "Desenvolver novos recursos e funcionalidades",
                "Prevenir fraudes e atividades ilícitas",
              ],
            },
            "Para comunicação:",
            {
              type: "list",
              items: [
                "Responder a dúvidas e solicitações",
                "Enviar comunicados importantes sobre a plataforma",
                "Informar sobre atualizações nos termos de uso e políticas",
              ],
            },
          ],
        },
        {
          subtitle: "3.2 FINALIDADES SECUNDÁRIAS (COM CONSENTIMENTO)",
          content: [
            "Marketing e promoções:",
            {
              type: "list",
              items: [
                "Envio de ofertas personalizadas",
                "Newsletter com dicas e conteúdos relevantes",
                "Campanhas promocionais de estabelecimentos parceiros",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "4. BASES LEGAIS PARA O TRATAMENTO",
      content: [
        "O tratamento dos dados pessoais na A&N Agendamentos fundamenta-se nas seguintes bases legais:",
        {
          type: "list",
          items: [
            "Art. 7º, I - Consentimento: Para finalidades de marketing, newsletters e comunicações promocionais.",
            "Art. 7º, V - Execução de contrato: Para processamento de agendamentos, pagamentos e prestação dos serviços da plataforma.",
            "Art. 7º, IX - Legítimo interesse: Para melhorias na plataforma, prevenção a fraudes, análises estatísticas e personalização da experiência do usuário.",
            "Art. 7º, II - Cumprimento de obrigação legal: Para cumprimento de obrigações fiscais, trabalhistas e regulatórias.",
          ],
        },
      ],
    },
    {
      title: "5. COMPARTILHAMENTO DE DADOS",
      subsections: [
        {
          subtitle: "5.1 COMPARTILHAMENTO NECESSÁRIO",
          content: [
            "Com o Mercado Pago:",
            {
              type: "list",
              items: [
                "Dados de pagamento para processamento de transações",
                "Informações de clientes e estabelecimentos necessárias para o marketplace",
                "Dados para prevenção de fraudes",
              ],
            },
            "Com Google Cloud Platform:",
            {
              type: "list",
              items: [
                "Armazenamento seguro dos dados da aplicação",
                "Processamento através das Cloud Functions",
                "Backup e recuperação de dados",
              ],
            },
            "Com Vercel:",
            {
              type: "list",
              items: [
                "Hospedagem da interface web da plataforma",
                "Otimização de performance",
              ],
            },
          ],
        },
        {
          subtitle: "5.2 COMPARTILHAMENTO ENTRE USUÁRIOS",
          content: [
            "Entre Clientes e Estabelecimentos:",
            {
              type: "list",
              items: [
                "Nome do cliente para identificação do agendamento",
                "Dados de contato apenas quando necessário para o serviço",
              ],
            },
            "Estabelecimentos e Profissionais:",
            {
              type: "list",
              items: [
                "Informações necessárias para prestação do serviço",
                "Agenda de atendimentos",
              ],
            },
          ],
        },
        {
          subtitle: "5.3 COMPARTILHAMENTO COM AUTORIDADES",
          content: [
            "Dados podem ser compartilhados com autoridades competentes mediante:",
            {
              type: "list",
              items: [
                "Ordem judicial",
                "Requisição de órgãos reguladores",
                "Investigações criminais",
                "Cumprimento de obrigações legais",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "16. CONTATO",
      content: [
        "Para questões relacionadas a esta Política de Privacidade:",
        {
          type: "list",
          items: [
            "Encarregado de Proteção de Dados: suporte@anagendamentos.com.br",
            "Telefone: (16) 99764-3604",
            "Endereço: Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
            "Horário de Atendimento: Segunda a sexta-feira, das 9h às 17h",
          ],
        },
      ],
    },
  ],
};
