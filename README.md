# A&N Agendamentos - Sistema de Agendamentos Online 24/7

Uma plataforma completa de agendamentos online desenvolvida com Next.js e Firebase, integrada ao Mercado Pago para processamento de pagamentos. O sistema conecta clientes, estabelecimentos e profissionais em uma única plataforma intuitiva.

## 🚀 Funcionalidades

### Para Clientes

- **Cadastro e autenticação** segura com validação de dados
- **Busca e descoberta** de estabelecimentos por localização e serviços
- **Agendamento online** com seleção de profissionais e horários
- **Sistema de favoritos** para salvar estabelecimentos preferidos
- **Dashboard personalizado** com histórico e agendamentos futuros
- **Pagamentos integrados** via Mercado Pago Checkout Pro
- **Cancelamento de agendamentos** com regras de antecedência (3 horas)
- **Reembolsos automáticos** para cancelamentos dentro do prazo
- **Sistema de avaliações** e feedback

### Para Proprietários de Estabelecimentos

- **Painel administrativo** completo para gestão do negócio
- **Cadastro de serviços** com preços e duração
- **Gerenciamento de profissionais** com sistema de convites
- **Agenda integrada** com visão de todos os agendamentos
- **Integração com Mercado Pago** via Mercado Pago Connect
- **Controle de disponibilidade** por profissional
- **Sistema de comissões** e taxas automáticas
- **Relatórios e métricas** de desempenho
- **URLs personalizadas** (slug) para o estabelecimento
- **Upload de imagens** e galeria de trabalhos
- **Configuração de horários de funcionamento**
- **Sistema de penalidades** para reembolsos em atraso

### Para Profissionais

- **Painel dedicado** com agenda pessoal
- **Visualização de agendamentos** sem dados sensíveis do cliente
- **Sistema de convites** automático pelo proprietário
- **Gestão de disponibilidade** individual
- **Notificações** de novos agendamentos

## 🏗️ Arquitetura Técnica

### Frontend (Next.js)

- **Framework**: Next.js 15.4.6 com App Router
- **Linguagem**: TypeScript para tipagem forte
- **Estilização**: Tailwind CSS para design responsivo
- **Estado**: Context API para autenticação global
- **Componentes**: Arquitetura modular com componentes reutilizáveis

#### Estrutura de Páginas:

- `/` - Landing page com seções para diferentes tipos de usuários
- `/login`, `/register`, `/reset-password` - Autenticação completa
- `/client/*` - Dashboard e funcionalidades do cliente
- `/owner/*` - Painel administrativo do proprietário
- `/professional/*` - Área do profissional
- `/checkout` - Processamento de pagamentos
- `/search` - Busca de estabelecimentos

### Backend (Firebase Cloud Functions V2)

- **Linguagem**: TypeScript
- **Runtime**: Node.js serverless
- **Região**: South America East 1 (São Paulo)

#### Funções Principais:

**Pagamentos (Mercado Pago):**

- `generateMercadoPagoOnboardingLink` - Gera URLs de conexão de conta
- `exchangeCodeForCredentials` - Troca código OAuth por credenciais
- `createMercadoPagoPreference` - Cria preferências de pagamento
- `mercadoPagoWebhook` - Processa notificações de pagamento

**Agendamentos:**

- `clientCancelAppointment` - Cancelamento pelo cliente com reembolso
- `ownerCancelAppointment` - Cancelamento pelo proprietário
- `getProfessionalAvailability` - Consulta disponibilidade em tempo real

**Gestão de Usuários:**

- `inviteProfessional` / `resendInvite` - Sistema de convites
- `deleteClientAccount` / `deleteOwnerAccount` - Exclusão de contas
- `setInitialUserClaims` - Configuração de permissões

**Automação:**

- `onUserRoleChange` - Sincroniza custom claims automaticamente
- `onEstablishmentWritten` - Gera slugs únicos para URLs
- `onFavoriteCreate/Delete` - Atualiza contadores atomicamente
- `monitorarReembolsos` - Verifica reembolsos em atraso (24h)
- `cleanupPendingPayments` - Remove pagamentos expirados

### Banco de Dados (Firestore)

```
users/
├── {uid}/
│   ├── firstName, lastName, email, role
│   └── favorites/{establishmentId}

establishments/
├── {ownerId}/
│   ├── name, slug, address, mpCredentials
│   ├── services/{serviceId}
│   ├── professionals/{professionalId}
│   ├── appointments/{appointmentId}
│   └── penalties/{penaltyId}
```

### Segurança (Firestore Rules)

- **Custom Claims** baseados em roles (owner/client/professional)
- **Regras granulares** por coleção e subcoleção
- **Validação de propriedade** para operações sensíveis
- **Leitura pública** para dados de estabelecimentos
- **Isolamento de dados** por usuário e estabelecimento

### Integração de Pagamentos

- **Mercado Pago Connect** para onboarding de vendedores
- **Checkout Pro** para experiência de pagamento otimizada
- **Webhooks** para confirmação automática de pagamentos
- **Sistema de marketplace** com comissões automáticas (4.99%)
- **Reembolsos automáticos** via API
- **Cobrança de multas** por atraso em reembolsos (10%)

## 🛠️ Tecnologias

### Principais Dependências

```json
{
  "next": "15.4.6",
  "react": "19.1.0",
  "typescript": "^5.6.3",
  "firebase": "^12.1.0",
  "firebase-admin": "^13.4.0",
  "mercadopago": "^2.8.0",
  "@mercadopago/sdk-react": "^1.0.3",
  "tailwindcss": "^3.4.17",
  "framer-motion": "^12.23.12"
}
```

### Ferramentas de Desenvolvimento

- **ESLint** - Linting e padronização de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Compatibilidade com browsers
- **Sentry** - Monitoramento de erros em produção

## 📱 Funcionalidades Avançadas

### PWA (Progressive Web App)

- **Service Worker** registrado para funcionamento offline
- **Manifesto** configurado para instalação em dispositivos
- **Cache inteligente** para melhor performance

### SEO e Performance

- **URLs amigáveis** com sistema de slugs únicos
- **Metadados dinâmicos** por página
- **Otimização de imagens** automática
- **Server-Side Rendering** com Next.js

### Sistema de Notificações

- **Lembretes automáticos** de agendamentos
- **Notificações push** para atualizações importantes
- **Emails transacionais** para confirmações

### Analytics e Monitoramento

- **Sentry integration** para tracking de erros
- **Métricas de performance** integradas
- **Logs estruturados** nas Cloud Functions

## 🚀 Deploy e Hospedagem

### Frontend

- **Vercel** - Build e hospedagem automática
- **Integração contínua** com GitHub
- **Domínio personalizado**: aenagendamentos.com.br

### Backend

- **Firebase Hosting** para arquivos estáticos
- **Cloud Functions** para lógica serverless
- **Firestore** para banco de dados em tempo real
- **Cloud Storage** para upload de imagens

### Configurações de Ambiente

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

# Mercado Pago (via Secret Manager)
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_APP_ID=
MERCADOPAGO_SECRET_KEY=
```

## 📋 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta Mercado Pago Developers

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/alessandrotostes/Projeto--Sal-es-Barbearias.git

# Navegue para o diretório do app
cd Projeto--Sal-es-Barbearias/app-agendamento

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em modo desenvolvimento
npm run dev
```

### Deploy das Cloud Functions

```bash
# Navegue para o diretório functions
cd functions

# Instale as dependências
npm install

# Deploy das functions
firebase deploy --only functions
```

## 📊 Modelo de Negócio

### Sistema de Marketplace

- **Taxa por transação**: 4.99% sobre o valor do serviço
- **Multas por atraso**: 10% do valor para reembolsos não processados em 5 dias
- **Suspensão automática** de contas inadimplentes

### Controle de Qualidade

- **Sistema de avaliações** obrigatório
- **Monitoramento de reembolsos** automatizado
- **Penalidades por descumprimento** de prazos
- **Mediação de conflitos** integrada

## 🔒 Segurança e Compliance

### Proteção de Dados

- **Criptografia** de dados sensíveis
- **Tokenização** de informações de pagamento
- **Logs de auditoria** para todas as transações
- **Backup automático** de dados críticos

### Conformidade Legal

- **Termos de uso** e política de privacidade integrados
- **LGPD compliance** com consentimento explícito
- **PCI DSS** via integração Mercado Pago
- **Exclusão de dados** Feita diretamente do perfil do usuário.

## 🤝 Contribuição

### Estrutura de Branches

- `master` - Produção
- `develop` - Desenvolvimento principal
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções críticas

### Padrões de Código

- **TypeScript strict** habilitado
- **ESLint** configurado com regras Next.js
- **Componentes funcionais** com hooks
- **Nomenclatura descritiva** para funções e variáveis

---

## 📞 Suporte

Para dúvidas técnicas ou problemas com a plataforma:

- **Website**: [aenagendamentos.com.br](https://aenagendamentos.com.br)
- **Email**: suporte@aenagendamentos.com.br

---

## 📄 Licença

Este projeto é **software proprietário** licenciado sob termos restritivos.

- ✅ **Permitido**: Visualização educacional, fork para contribuições
- ❌ **Proibido**: Uso comercial, distribuição, modificação não autorizada

Para **licenciamento comercial**, entre em contato através dos canais oficiais.

**Copyright © 2025 Alessandro Tostes. Todos os direitos reservados.**

Consulte o arquivo [LICENSE](LICENSE) para detalhes completos.
