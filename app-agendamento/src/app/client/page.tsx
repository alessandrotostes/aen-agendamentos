"use client";

import React, { useState } from "react";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import OwnerHeader from "../../components/owner/OwnerHeader"; // Reutilizando o header
import ClientDashboardView from "../../components/client/ClientDashboardView";
import EstablishmentSearchView from "../../components/client/EstablishmentSearchView";

export default function ClientPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "search">(
    "dashboard"
  );

  return (
    <ClientRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Usamos um header consistente */}
        <OwnerHeader establishment={null} onPhotoUpdated={() => {}} />

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
