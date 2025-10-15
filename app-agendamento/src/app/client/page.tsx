// src/app/client/page.tsx
"use client";

import React, { useState } from "react";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import ClientHeader from "../../components/client/ClientHeader";
import ClientDashboardView from "../../components/client/ClientDashboardView";
import EstablishmentSearchView from "../../components/client/EstablishmentSearchView";
// 1. Importar o nosso novo componente "em breve"
import ComingSoonShowcase from "../../components/client/ComingSoonShowcase";
import ClientSettingsView from "../../components/client/ClientSettingsView";

type ActiveView = "dashboard" | "search" | "settings";

// 2. A nossa "chave" para ligar ou desligar a funcionalidade de busca
//    Quando quiser reativar a busca, basta mudar para 'true'.
const IS_SEARCH_FEATURE_ENABLED = false;

export default function ClientPage() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ClientDashboardView
            onNavigateToSearch={() => setActiveView("search")}
          />
        );

      // 3. Lógica condicional adicionada aqui
      case "search":
        return IS_SEARCH_FEATURE_ENABLED ? (
          <EstablishmentSearchView
            onNavigateBack={() => setActiveView("dashboard")}
          />
        ) : (
          <ComingSoonShowcase
            onNavigateBack={() => setActiveView("dashboard")}
          />
        );

      case "settings":
        return <ClientSettingsView />;

      default:
        return (
          <ClientDashboardView
            onNavigateToSearch={() => setActiveView("search")}
          />
        );
    }
  };

  return (
    <ClientRoute>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white sticky top-0 z-20 shadow-sm p-3 border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <ClientHeader
              activeView={activeView}
              onNavigate={(view) => setActiveView(view)}
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {renderActiveView()}
        </main>
      </div>
    </ClientRoute>
  );
}
