// src/app/owner/settings/page.tsx (NOVO ARQUIVO)
"use client";

import React from "react";
// Importar o HOC para proteger a rota
import { OwnerRoute } from "@/components/auth/ProtectedRoute";
// Importar o componente que você criou
import OwnerSettingsView from "@/components/owner/OwnerSettingsView";

// Componente da Página
function OwnerSettingsPage() {
  return (
    // OwnerRoute garante que apenas proprietários logados acessem esta página
    <OwnerRoute>
      <div className="p-4 sm:p-6 lg:p-8">
        <OwnerSettingsView />
      </div>
    </OwnerRoute>
  );
}

export default OwnerSettingsPage;
