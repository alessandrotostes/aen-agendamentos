# 💈 Projeto - Salões & Barbearias

Plataforma moderna de **agendamento online** para barbearias e salões, integrando clientes, profissionais e estabelecimentos em um ambiente rápido, funcional e seguro.

---

## 📌 Visão Geral

Automatize o atendimento, organize a agenda, ofereça uma experiência digital profissional e aumente a produtividade do seu salão ou barbearia com este sistema completo. 

O projeto contempla desde o **agendamento inteligente** até a **gestão de profissionais, serviços, clientes e estatísticas**, sendo totalmente adaptável às necessidades do mercado de beleza.

---

## 🚀 Funcionalidades

- ✅ **Sistema de Agendamento Online**  
  Visualização de horários disponíveis, agendamento com confirmação instantânea.

- 🛠 **Painel Administrativo**  
  Controle de profissionais, serviços, agenda, estatísticas e permissões.

- 👥 **Gestão de Profissionais**  
  Cadastro, edição e organização dos colaboradores.

- 💇‍♂️ **Gestão de Serviços**  
  Categorização dos tipos de serviços, preço e duração.

- 📁 **Gestão de Clientes**  
  Histórico de clientes, agendamentos e buscas rápidas.

- 🔔 **Notificações**  
  Lembretes automáticos e comunicados via e-mail (integrável com SMS/WhatsApp).

- 📱 **PWA & SEO**  
  Progressive Web App instalável e otimização para buscadores.

- 🛒 **Marketplace Modular**  
  Integração (opcional) com pagamentos e onboarding de salões.

- 🔐 **Segurança e Autenticação**  
  Proteção de rotas, autenticação via Firebase/Auth e permissões por tipo de usuário.

- 📊 **Relatórios & Estatísticas**  
  Gráficos e relatórios de movimentação, produtividade e faturamento.

- 📱 **Responsividade Total**  
  Interface adaptada para desktop, tablet e mobile.

---

## 🛠 Tecnologias Utilizadas

- **Next.js** – SSR, SSG, SPA, rotas dinâmicas  
- **TypeScript** – Tipagem estática robusta  
- **Tailwind CSS** – Estilos modernos e responsivos  
- **Firebase** – Autenticação, Firestore, functions serverless  
- **Vercel** – Deploy instantâneo com preview automático  
- **React Icons / Lucide** – Conjunto moderno de ícones  
- **Recharts** – Visualização gráfica de dados  
- **PWA** – Progressive Web App instalável  
- **SEO Dinâmico** – Meta tags e sitemap dinâmico

---

## 📁 Estrutura Detalhada do Projeto

```yaml
Projeto--Sal-es-Barbearias/
├── src/
│ ├── app/ # App Router do Next.js (rotas, layouts e páginas principais)
│ │ ├── auth/ # Telas e lógica de autenticação (login, cadastro, etc)
│ │ ├── api/ # Endpoints internos (webhooks, integrações Next.js)
│ │ ├── checkout/ # Fluxo de pagamentos e agendamentos
│ │ ├── client/ # Área exclusiva do cliente (perfil, histórico, notificações)
│ │ ├── owner/ # Área administrativa do proprietário/salão
│ │ ├── politica-de-privacidade/ # Página com os termos de política de privacidade
│ │ ├── professional/ # Área do profissional colaborador
│ │ ├── termos-de-uso/ # Página com os termos de uso do serviço
│ │ ├── search/ # Rotas
│ │ ├── layout.tsx # Layout global da aplicação (menu, header, footer, provedores)
│ │ ├── page.tsx # Página principal (home ou dashboard inicial)
│ │ ├── globals.css # Estilos globais do projeto
│ │ ├── head.tsx # Configuração global do <head> (meta tags, favicon, SEO)
│ │ ├── error.tsx # Página de erro padrão em falhas de renderização/navegação
│ │ ├── loading.tsx # Componente global para loading durante transições de rotas
│ │ └── global-error.tsx # Página 404
│ ├── components/ # Componentes reutilizáveis: auth, checkout, client, landig, owner, shared. (botões, modais, formulários)
│ ├── context/ # Contextos globais (auth, agenda, permissões)
│ ├── hooks/ # Custom hooks
│ ├── services/ # Integrações: Firebase, APIs externas, notificações
│ ├── styles/ # Temas e configuração do Tailwind CSS
│ ├── utils/ # Funções auxiliares e helpers
├── public/ # Imagens, ícones, manifest PWA, favicon, arquivos estáticos
├── .vscode/ # Configuração recomendada para editores de código
├── firebase.json # Deploy do Firebase Hosting/Functions
├── package.json # Dependências, scripts npm
├── tsconfig.json # Configuração TypeScript
├── tailwind.config.js # Customização Tailwind CSS
├── postcss.config.js # Processamento CSS
├── .env.local
└── README.md # Documentação principal do projeto

```
### Descrição das pastas principais em src/app

- auth/: Telas e lógica de autenticação (login, cadastro, recuperação de senha)
- api/: Endpoints internos, webhooks e integrações Next.js
- checkout/: Fluxo e páginas de pagamento/agendamento
- client/: Área do cliente final (perfil, histórico, notificação)
- owner/: Área do proprietário/admin (dashboard, gestão de serviços/profissionais)
- politica-de-privacidade/: Política de privacidade do serviço
- termos-de-uso/: Termos de uso acordados com o usuário
- search/: Página ou funcionalidade para buscas gerais (serviços, agendamentos, profissionais)

- layout.tsx: Layout global do app (menus, headers, footers, contextos)
- page.tsx: Página inicial/dash
- globals.css: Estilos globais
- head.tsx: Meta tags/SEO central
- error.tsx: Tela de erro global
- loading.tsx: Loader global/transição de rotas
- global-error.tsx Página para erro 404

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/alessandrotostes/Projeto--Sal-es-Barbearias.git
cd Projeto--Sal-es-Barbearias
```
### 2. Instale as dependências:
```bash
npm install
```

### 3. Configure as variáveis de ambiente:
- Crie um arquivo `.env.local` na raiz do projeto com suas credenciais do Firebase/Auth e demais APIs externas necessárias.
- **Exemplo:**  
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxx
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxx
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxx
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxx
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxx
  NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxx
  NEXT_PUBLIC_PAYMENT_FUNCTION_URL=xxxxxx
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=xxxxxx
  Entre outras
  ```
  ### 4. Execute o projeto em modo desenvolvimento:
  ```bash
  npm run dev
  ```
  ## ☁️ Deploy

- **Vercel:**  
- Acesse [Vercel](https://vercel.com), conecte seu repositório, configure as variáveis de ambiente e realize o deploy automático.
- **Firebase Hosting:**  
- Configure o arquivo `firebase.json` na raiz do projeto e execute:
 ```
 firebase deploy
 ```
- Certifique-se de instalar e autenticar o Firebase CLI previamente.

---

## 🤝 Contribuição

1. Faça um fork do projeto e crie uma branch para sua melhoria ou feature:
```bash
git checkout -b feature/nome-da-feature
```

2. Realize seus commits:
```bash
git commit -m "feat: descreva a feature"
```
3. Abra um Pull Request detalhado no GitHub, explicando a motivação e as alterações propostas.

---

## 📄 Licença

Este projeto está sob licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por Alessandro Tostes.

Para dúvidas, sugestões ou parcerias, utilize o perfil do GitHub ou LinkedIn para contato.





