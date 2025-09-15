// src/app/client/page.tsx (VERSÃO FINAL UNIFICADA)
"use client";

import React, { useState } from "react";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import ClientHeader from "../../components/client/ClientHeader";
import ClientDashboardView from "../../components/client/ClientDashboardView";
import EstablishmentSearchView from "../../components/client/EstablishmentSearchView";
import ClientSettingsView from "../../components/client/ClientSettingsView"; // Importar a nova vista

type ActiveView = "dashboard" | "search" | "settings";

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
      case "search":
        return (
          <EstablishmentSearchView
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
