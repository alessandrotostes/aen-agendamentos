"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

// Um componente simples para ser exibido durante a verificação de autenticação.
const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <p className="text-slate-500">A verificar autenticação...</p>
  </div>
);

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [loading, currentUser, router]);

  // Mostra um loader em vez de 'null' para evitar a tela branca
  if (loading || !currentUser) {
    return <AuthLoading />;
  }
  return <>{children}</>;
}

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Se o carregamento terminou e o usuário não é um "owner", redireciona.
    if (!loading && userData?.role !== "owner") {
      router.push("/login"); // Redireciona para o login por segurança
    }
  }, [loading, userData, router]);

  // Mostra um loader enquanto carrega OU se o usuário não for um "owner"
  // Isto dá tempo para o redirecionamento acontecer sem mostrar a tela branca.
  if (loading || userData?.role !== "owner") {
    return <AuthLoading />;
  }

  // Apenas renderiza o conteúdo se tudo estiver correto.
  return <>{children}</>;
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "client") {
      router.push("/login"); // Redireciona para o login por segurança
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "client") {
    return <AuthLoading />;
  }
  return <>{children}</>;
}
