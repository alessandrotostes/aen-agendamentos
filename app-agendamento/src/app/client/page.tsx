"use client";

import React, { useState } from "react";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import ClientHeader from "../../components/client/ClientHeader"; // Importando o novo header
import ClientDashboardView from "../../components/client/ClientDashboardView";
import EstablishmentSearchView from "../../components/client/EstablishmentSearchView";

export default function ClientPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "search">(
    "dashboard"
  );

  const handleSearchClick = () => {
    setActiveView("search");
  };

  const handleFavoritesClick = () => {
    // Futuramente, podemos criar uma nova vista para os favoritos.
    // Por enquanto, podemos navegar para a busca como exemplo.
    console.log("Botão de favoritos clicado!");
    setActiveView("search"); // Pode ajustar para onde quer navegar
  };

  return (
    <ClientRoute>
      <div className="min-h-screen bg-slate-50">
        {/* --- ALTERAÇÃO PRINCIPAL: NOVO HEADER --- */}
        {/* O header agora é específico para o cliente e está integrado com a navegação da página. */}
        <header className="bg-white sticky top-0 z-10 shadow-sm p-4 border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <ClientHeader
              onSearchClick={handleSearchClick}
              onFavoritesClick={handleFavoritesClick}
            />
          </div>
        </header>
        {/* --- FIM DA ALTERAÇÃO --- */}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {activeView === "dashboard" ? (
            <ClientDashboardView
              onNavigateToSearch={() => setActiveView("search")}
            />
          ) : (
            <EstablishmentSearchView
              onNavigateBack={() => setActiveView("dashboard")}
            />
          )}
        </main>
      </div>
    </ClientRoute>
  );
}
