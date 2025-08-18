"use client";

import React, { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../owner/common/LoadingSpinner";

// Um componente simples para ser exibido durante a verificação de autenticação.
const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Guardião para páginas que SÓ utilizadores LOGADOS podem ver (qualquer tipo)
export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [loading, currentUser, router]);

  if (loading || !currentUser) {
    return <AuthLoading />;
  }
  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores 'owner' podem ver
export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "owner") {
      router.push("/login");
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "owner") {
    return <AuthLoading />;
  }

  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores 'client' podem ver
export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "client") {
      router.push("/login");
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "client") {
    return <AuthLoading />;
  }
  return <>{children}</>;
}

// --- NOVO COMPONENTE ADICIONADO ---
// Guardião para páginas que SÓ utilizadores NÃO LOGADOS podem ver
// (Ex: /login, /register, /reset-password)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Se o carregamento terminou e o utilizador ESTÁ logado...
    if (!loading && currentUser && userData) {
      // ...redireciona para o dashboard apropriado.
      const destination = userData.role === "owner" ? "/owner" : "/client";
      router.replace(destination);
    }
  }, [loading, currentUser, userData, router]);

  // Enquanto carrega ou se o utilizador estiver logado (à espera de redirecionar), mostra o loader.
  if (loading || currentUser) {
    return <AuthLoading />;
  }

  // Se não estiver logado, mostra a página pública.
  return <>{children}</>;
}
