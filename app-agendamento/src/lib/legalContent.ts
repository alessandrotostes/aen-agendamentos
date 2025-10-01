// src/lib/legalContent.ts

export type ContentItem =
  | string
  | { type: "list"; items: string[] }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | {
      type: "paragraph";
      text: string;
      formatting?: "bold" | "italic" | "normal";
    }
  | {
      type: "highlight";
      text: string;
      emphasis: "important" | "warning" | "info";
    };

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
        {
          type: "paragraph",
          text: "Bem-vindo à A&N Agendamentos",
          formatting: "bold",
        },
        "A A&N Agendamentos é uma plataforma digital que conecta clientes a estabelecimentos e profissionais de diversos segmentos, facilitando o agendamento de serviços, processamento de pagamentos e visualização de relatórios gerenciais.",
        {
          type: "highlight",
          text: "Operadora: TS Desenvolvimentos",
          emphasis: "info",
        },
        "CNPJ: **50.711.059/0001-66**",
        "Endereço: **Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583**",
        { type: "italic", text: "Doravante denominada 'Plataforma'" },
      ],
    },
    {
      title: "DEFINIÇÕES",
      content: [
        {
          type: "paragraph",
          text: "Para fins deste documento, entende-se por:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "**Plataforma:** O sistema, website ou aplicativo operado pela empresa",
            "**Cliente:** Pessoa física ou jurídica que agenda serviços via a plataforma",
            "**Proprietário:** Pessoa jurídica responsável por estabelecimentos parceiros",
            "**Profissional:** Pessoa habilitada que executa serviços em nome do estabelecimento",
            "**Estabelecimento:** Local físico ou empresa prestadora de serviços",
            "**Serviços:** Atividades ofertadas pelo estabelecimento/profissional e intermediadas pela plataforma",
            "**Usuário:** Termo que inclui Cliente, Proprietário e Profissional",
          ],
        },
      ],
    },
    {
      title: "1. ACEITAÇÃO DOS TERMOS",
      content: [
        {
          type: "highlight",
          text: "IMPORTANTE: Leia atentamente antes de usar a plataforma",
          emphasis: "warning",
        },
        "**1.1.** O uso da Plataforma implica **aceitação integral** destes Termos.",
        "**1.2.** Estes Termos complementam a **Política de Privacidade**.",
        "**1.3.** Cadastro permitido apenas a *maiores de 18 anos* ou menores de idade devidamente representados.",
        "**1.4.** A Plataforma poderá atualizar estes Termos, com **aviso prévio de pelo menos 5 dias corridos**.",
      ],
    },
    {
      title: "2. SERVIÇOS OFERECIDOS",
      content: [
        {
          type: "paragraph",
          text: "2.1. Funcionalidades da plataforma incluem:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "🔍 **Busca e filtros** de estabelecimentos e serviços",
            "📅 **Agendamento online** com confirmação automática",
            "💳 **Processamento de pagamentos** via Mercado Pago (cartão, PIX, boleto)",
            "🔔 **Gestão de agendas** e notificações",
            "⭐ **Sistema de avaliações** e feedback",
            "📱 **Lembretes** e integrações externas (ex: Google Agenda)",
            "📊 **Ferramenta de relatórios**, fornecendo ao estabelecimento:",
          ],
        },
        {
          type: "list",
          items: [
            "   • Faturamento e volume de vendas por período selecionado",
            "   • Rentabilidade por tipo de serviço",
            "   • Desempenho individual de cada profissional",
            "   • Mapa de calor (heatmap) dos horários de maior demanda",
          ],
        },
        {
          type: "highlight",
          text: "A Plataforma atua como intermediadora tecnológica",
          emphasis: "info",
        },
        "*Não executamos serviços nem nos responsabilizamos pela execução direta entre Cliente e Estabelecimento.*",
      ],
    },
    {
      title: "3. CADASTRO E CONTAS",
      content: [
        {
          type: "paragraph",
          text: "3.1. Informações Obrigatórias",
          formatting: "bold",
        },
        "Para utilizar a Plataforma, o Usuário deve informar **dados completos e verdadeiros**:",
        "**3.2. Dados mínimos para cadastro:**",
        {
          type: "list",
          items: [
            "👤 **Cliente:** nome, e-mail, telefone e CPF",
            "🏢 **Proprietário:** razão social, CNPJ, responsável, endereço",
            "👨‍⚕️ **Profissional:** nome, e-mail, telefone, comprovação de habilitação e CPF",
          ],
        },
        { type: "highlight", text: "RESPONSABILIDADE", emphasis: "warning" },
        "**3.3.** O Usuário é **responsável pela veracidade** dos dados.",
        "**3.4.** O Usuário compromete-se a manter em **sigilo suas credenciais** de acesso.",
        "**3.5.** Cada pessoa física/jurídica pode possuir apenas **uma conta representante** na Plataforma.",
      ],
    },
    {
      title: "4. COLETA E TRATAMENTO DO CPF",
      content: [
        {
          type: "highlight",
          text: "PROTEÇÃO DE DADOS PESSOAIS",
          emphasis: "info",
        },
        "Para viabilizar o cadastro, autenticação, processamento de pagamentos, emissão de comprovantes fiscais e garantir segurança nas transações, a Plataforma **coleta e trata o número de CPF** dos Clientes e dos Profissionais cadastrados.",
        {
          type: "paragraph",
          text: "O CPF será utilizado exclusivamente para:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "🔐 **Identificação segura** dos Usuários",
            "📋 **Emissão de notas fiscais** quando aplicável",
            "⚖️ **Cumprimento de obrigações** legais e regulatórias",
            "🛡️ **Prevenção a fraudes** e segurança das transações",
          ],
        },
        { type: "highlight", text: "CONFORMIDADE LGPD", emphasis: "info" },
        "A coleta e o tratamento desses dados pessoais são realizados em **conformidade com a Lei Geral de Proteção de Dados** (Lei nº 13.709/2018 – LGPD) e demais legislações aplicáveis, garantindo a proteção, a confidencialidade e a transparência no uso dessas informações.",
        { type: "paragraph", text: "CONSENTIMENTO:", formatting: "bold" },
        "O Usuário **declara estar ciente e concordar** com o tratamento do seu CPF para as finalidades acima descritas ao aceitar estes Termos de Uso e ao se cadastrar na Plataforma.",
      ],
    },
    {
      title: "5. CANCELAMENTO, DIREITO DE ARREPENDIMENTO E REEMBOLSO",
      subsections: [
        {
          subtitle: "5.1. Direito de Arrependimento (art. 49 CDC)",
          content: [
            {
              type: "highlight",
              text: "DIREITO LEGAL DE ARREPENDIMENTO - 7 DIAS",
              emphasis: "important",
            },
            "**5.1.1.** Para qualquer serviço contratado via internet, telefone ou outro meio remoto, o Cliente pode **desistir do agendamento** ou compra no prazo de até **7 (sete) dias corridos** da contratação ou do recebimento do serviço.",
            "**5.1.2.** O cancelamento dentro do prazo legal garante **reembolso integral** dos valores pagos, em até **7 dias** da solicitação, *sem necessidade de justificativa* e *sem custos adicionais* para o consumidor.",
            "**5.1.3.** O reembolso é realizado na **mesma modalidade de pagamento** utilizada pelo Cliente, salvo se este preferir crédito ou compensação diferente.",
          ],
        },
        {
          subtitle: "5.2. Cancelamento e Reembolso Automático via Plataforma",
          content: [
            {
              type: "highlight",
              text: "CANCELAMENTO AUTOMÁTICO - 3 HORAS",
              emphasis: "info",
            },
            "**5.2.1.** O Cliente pode solicitar o **cancelamento e reembolso automático** de seu agendamento pela plataforma em até **3 (três) horas** antes do horário marcado para o serviço.",
            "**5.2.2.** Nessa condição, a devolução será **processada automaticamente** pela Plataforma, respeitando a política de reembolso vigente.",
            {
              type: "highlight",
              text: "ATENÇÃO: Menos de 3 horas",
              emphasis: "warning",
            },
            "**5.2.3.** Caso o pedido de cancelamento seja realizado com **menos de 3 (três) horas** de antecedência, o Cliente deverá *contatar diretamente o Estabelecimento* para negociação e solicitação de eventual reembolso, conforme regras e condições específicas do prestador, respeitando o CDC.",
            "**5.2.4.** Em todos os casos, a Plataforma disponibiliza o suporte via **Serviço de Atendimento ao Consumidor (SAC)** para esclarecimento de dúvidas e auxílio no processo de cancelamento e reembolso.",
          ],
        },
        {
          subtitle: "5.3. Política de Reembolso Pós-Arrependimento",
          content: [
            "**5.3.1.** Após o período legal de arrependimento, aplicam-se as regras para cancelamentos e reembolsos, podendo haver **retenção parcial** conforme antecedência do cancelamento.",
            "**5.3.2.** Cancelamentos efetuados por Estabelecimentos geram **reembolso integral** ao Cliente, independentemente do prazo.",
            "**5.3.3.** Todos os reembolsos são processados via **Mercado Pago**, automaticamente ou manualmente, conforme disponibilidade financeira do Estabelecimento.",
            {
              type: "highlight",
              text: "PENALIDADE POR ATRASO NO REEMBOLSO",
              emphasis: "warning",
            },
            "**5.3.4.** Caso o Estabelecimento não realize o reembolso manual em até **5 dias corridos** a contar da solicitação, será aplicada:",
            {
              type: "list",
              items: [
                "💰 **Multa de 10%** sobre o valor devido ao Cliente",
                "⏸️ **Suspensão temporária** da conta do Estabelecimento",
                "🔒 **Retenção dos futuros repasses** financeiros até regularização",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "6. PAGAMENTOS E PROCESSAMENTO FINANCEIRO",
      content: [
        {
          type: "highlight",
          text: "PROCESSAMENTO SEGURO VIA MERCADO PAGO",
          emphasis: "info",
        },
        "**6.1.** Todos os pagamentos são processados pela intermediadora **Mercado Pago**.",
        "**6.2.** O valor é **automaticamente dividido** entre Estabelecimento e Plataforma conforme acordado.",
        "**6.3.** Disputas técnicas são **reguladas pelo Mercado Pago**.",
      ],
    },
    {
      title: "7. RESPONSABILIDADE DA PLATAFORMA",
      content: [
        {
          type: "highlight",
          text: "RESPONSABILIDADE SOLIDÁRIA",
          emphasis: "important",
        },
        "**7.1.** A Plataforma atua como **intermediadora**, respondendo *solidariamente* em caso de falhas próprias ou descumprimento de obrigações.",
        "**7.2.** A responsabilidade solidária aplica-se especialmente quando a Plataforma **participa da cadeia de fornecimento** e recebe comissão.",
      ],
    },
    {
      title: "8. RELATÓRIOS E INSIGHTS (PARA ESTABELECIMENTOS)",
      content: [
        {
          type: "paragraph",
          text: "8.1. A Plataforma oferece painel de relatórios que permite ao Estabelecimento visualizar:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "💰 **Faturamento total** por período",
            "📈 **Rentabilidade** por serviço",
            "👥 **Produtividade individual** de profissionais",
            "🔥 **Mapa de calor** dos horários de maior demanda",
          ],
        },
        "**8.2.** Dados são tratados conforme a **LGPD**.",
      ],
    },
    {
      title: "9. CANAIS DE ATENDIMENTO (SAC)",
      content: [
        { type: "highlight", text: "ATENDIMENTO AO CLIENTE", emphasis: "info" },
        "**9.1.** A Plataforma dispõe de **canais de atendimento eficientes**, incluindo telefone e online, para reclamações, esclarecimentos, cancelamentos e solicitações de reembolso.",
        "**9.2.** Atendimento humano estará disponível no mínimo **8 horas diárias**, com canal **24/7 digital** para registros e suporte.",
      ],
    },
    {
      title: "10. CONTATO",
      content: [
        { type: "highlight", text: "FALE CONOSCO", emphasis: "info" },
        "📧 **E-mail:** suporte@aenagendamentos.com.br",
        "📱 **Telefone/WhatsApp:** (16) 99764-3604",
        "📍 **Endereço:** Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
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
        {
          type: "highlight",
          text: "COMPROMISSO COM SUA PRIVACIDADE",
          emphasis: "info",
        },
        "A A&N Agendamentos **valoriza e respeita a privacidade** de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com:",
        {
          type: "list",
          items: [
            "⚖️ **Lei Geral de Proteção de Dados** (LGPD - Lei 13.709/2018)",
            "🌐 **Marco Civil da Internet** (Lei 12.965/2014)",
            "📋 **Demais regulamentações aplicáveis**",
          ],
        },
        { type: "paragraph", text: "INTEGRAÇÃO:", formatting: "bold" },
        "Esta Política **integra os Termos e Condições Gerais de Uso** e se aplica a todos os usuários da plataforma A&N Agendamentos, incluindo website, aplicativos móveis e integrações.",
      ],
    },
    {
      title: "1. IDENTIFICAÇÃO DO CONTROLADOR",
      content: [
        { type: "highlight", text: "CONTROLADOR DOS DADOS", emphasis: "info" },
        {
          type: "list",
          items: [
            "🏢 **Razão Social:** TS Desenvolvimentos",
            "📄 **CNPJ:** 50.711.059/0001-66",
            "📍 **Endereço:** Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
            "📧 **E-mail para questões de privacidade:** suporte@aenagendamentos.com.br",
          ],
        },
      ],
    },
    {
      title: "2. DADOS PESSOAIS COLETADOS",
      subsections: [
        {
          subtitle: "2.1 Dados de Clientes",
          content: [
            {
              type: "paragraph",
              text: "📋 DADOS DE CADASTRO:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "👤 **Nome completo**",
                "🆔 **CPF** (para cadastro, identificação, emissão fiscal e segurança)",
                "📧 **Endereço de e-mail**",
                "📱 **Número de telefone**",
                "📅 **Histórico de agendamentos** e preferências",
                "⭐ **Avaliações** e favoritos",
                "🌍 **Dados de navegação** e localização aproximada via IP",
              ],
            },
          ],
        },
        {
          subtitle: "2.2 Dados de Profissionais",
          content: [
            {
              type: "paragraph",
              text: "👨‍⚕️ DADOS PROFISSIONAIS:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "👤 **Nome completo**",
                "🆔 **CPF** (para cadastro, identificação, emissão fiscal e segurança)",
                "📱 **Telefone de contato**",
                "📧 **E-mail**",
                "📜 **Comprovação de habilitação**",
                "📅 **Agenda de atendimentos** e vínculo com estabelecimentos",
              ],
            },
          ],
        },
        {
          subtitle: "2.3 Dados de Proprietários e Estabelecimentos",
          content: [
            {
              type: "paragraph",
              text: "🏢 DADOS EMPRESARIAIS:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "🏢 **Razão social / nome**",
                "📄 **CNPJ**",
                "📍 **Dados de contato** e endereço comercial",
                "💳 **Informações financeiras** para recebimentos",
                "⚙️ **Dados operacionais** (serviços, preços, agendas)",
              ],
            },
          ],
        },
        {
          subtitle: "2.4 Dados Técnicos",
          content: [
            {
              type: "paragraph",
              text: "🔧 COLETADOS AUTOMATICAMENTE:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "📊 **Logs de acesso** e uso da plataforma",
                "🍪 **Cookies** e tecnologias similares",
                "💻 **Informações do dispositivo**, IP e navegador",
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
          subtitle: "3.1 Principais",
          content: [
            {
              type: "paragraph",
              text: "🎯 PARA OPERAÇÃO DA PLATAFORMA:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "👤 **Criar e gerenciar contas**",
                "📅 **Processar agendamento** e pagamentos",
                "🔔 **Enviar notificações** e lembretes",
                "📋 **Emitir notas fiscais** e comprovantes",
                "🛡️ **Prevenir fraudes** e garantir segurança",
                "🆘 **Oferecer suporte** e atendimento",
              ],
            },
          ],
        },
        {
          subtitle: "3.2 Marketing (com consentimento)",
          content: [
            {
              type: "paragraph",
              text: "📢 MARKETING E PROMOÇÕES:",
              formatting: "bold",
            },
            {
              type: "list",
              items: ["🎯 **Envio de ofertas personalizadas** e newsletter"],
            },
          ],
        },
      ],
    },
    {
      title: "4. BASES LEGAIS DO TRATAMENTO",
      content: [
        {
          type: "paragraph",
          text: "O tratamento dos dados pessoais fundamenta-se nas seguintes bases legais:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "✅ **Execução de contrato** (art. 7º, V)",
            "👍 **Consentimento** (art. 7º, I), especialmente para marketing",
            "⚖️ **Cumprimento de obrigação legal** (art. 7º, II)",
            "🎯 **Legítimo interesse** (art. 7º, IX), para segurança e melhorias",
          ],
        },
      ],
    },
    {
      title: "5. COMPARTILHAMENTO DE DADOS",
      subsections: [
        {
          subtitle: "5.1 Com Parceiros",
          content: [
            {
              type: "paragraph",
              text: "🤝 COMPARTILHAMENTO NECESSÁRIO:",
              formatting: "bold",
            },
            {
              type: "list",
              items: [
                "💳 **Mercado Pago** (pagamentos e prevenção a fraudes)",
                "☁️ **Provedores de hospedagem** e cloud (Google Cloud, Vercel)",
                "🏢 **Estabelecimentos e profissionais**, na medida do necessário para a prestação do serviço",
              ],
            },
          ],
        },
        {
          subtitle: "5.2 Com Autoridades",
          content: [
            {
              type: "highlight",
              text: "COMPARTILHAMENTO LEGAL",
              emphasis: "warning",
            },
            "Dados podem ser compartilhados com autoridades competentes:",
            {
              type: "list",
              items: [
                "⚖️ **Mediante ordem judicial**, requisição de órgãos reguladores ou cumprimento de normas legais",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "6. SEGURANÇA E RETENÇÃO",
      content: [
        {
          type: "highlight",
          text: "PROTEÇÃO DOS SEUS DADOS",
          emphasis: "info",
        },
        "🔒 Utilizamos **práticas técnicas e administrativas** para proteger os dados contra acesso não autorizado, perda ou divulgação indevida.",
        "⏰ Os dados são mantidos pelo **tempo necessário** ao cumprimento das finalidades e obrigações legais.",
      ],
    },
    {
      title: "7. DIREITOS DOS USUÁRIOS",
      content: [
        {
          type: "paragraph",
          text: "Os usuários têm os seguintes direitos:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "✅ **Confirmação** de existência de tratamento",
            "👁️ **Acesso** aos dados pessoais",
            "✏️ **Correção** de dados incompletos, inexatos ou desatualizados",
            "🗑️ **Anonimização, bloqueio ou eliminação** de dados desnecessários",
            "📦 **Portabilidade** e revogação do consentimento",
            "ℹ️ **Informação** sobre compartilhamento dos dados",
          ],
        },
      ],
    },
    {
      title: "8. COOKIES E TECNOLOGIAS SEMELHANTES",
      content: [
        {
          type: "highlight",
          text: "COOKIES E EXPERIÊNCIA DO USUÁRIO",
          emphasis: "info",
        },
        "🍪 Utilizamos **cookies essenciais** para funcionamento da plataforma, além de cookies analíticos e funcionais para melhorar a experiência do usuário.",
        "⚙️ O usuário pode **configurar ou recusar** cookies, com possível impacto na experiência.",
      ],
    },
    {
      title: "9. ALTERAÇÕES NA POLÍTICA",
      content: [
        { type: "highlight", text: "ATUALIZAÇÕES", emphasis: "info" },
        "📝 Eventuais alterações serão **comunicadas com antecedência**, recomendando-se a revisão periódica pelo usuário.",
      ],
    },
    {
      title: "10. CONTATO",
      content: [
        {
          type: "paragraph",
          text: "Para questões relacionadas a esta Política de Privacidade:",
          formatting: "bold",
        },
        {
          type: "list",
          items: [
            "📧 **E-mail:** suporte@aenagendamentos.com.br",
            "📱 **Telefone:** (16) 99764-3604",
            "📍 **Endereço:** Rua Marcos Markarian, 565, Nova Aliança, Ribeirão Preto - SP, CEP 14026-583",
            "🕘 **Horário:** Segunda a sexta-feira, das 9h às 17h",
          ],
        },
      ],
    },
  ],
};
