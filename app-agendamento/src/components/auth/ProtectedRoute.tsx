// src/components/auth/ProtectedRoute.tsx (VERSÃO CORRIGIDA)
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../owner/common/LoadingSpinner";

const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

type UserRole = "client" | "owner" | "professional";

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const { userData, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // A lógica de redirecionamento só é avaliada quando o carregamento da autenticação termina.
    if (!authLoading) {
      if (!userData) {
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.push("/login");
      } else if (userData.role !== role) {
        const destination = {
          owner: "/owner",
          client: "/client",
          professional: "/professional/dashboard",
        }[userData.role];
        router.push(destination);
      }
    }
  }, [authLoading, userData, router, pathname, role]);

  // Lógica de renderização
  if (authLoading) {
    // 1. Se a autenticação ainda está a carregar, mostra sempre o loading.
    return <AuthLoading />;
  }

  if (userData && userData.role === role) {
    // 2. Se o carregamento terminou e o utilizador tem a permissão correta, mostra a página.
    return <>{children}</>;
  }

  // 3. Em todos os outros casos (sem utilizador, role errada), mostra o loading
  // enquanto o useEffect acima trata do redirecionamento. Isto evita a "piscada".
  return <AuthLoading />;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userData, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userData) {
      const destination = {
        owner: "/owner",
        client: "/client",
        professional: "/professional/dashboard",
      }[userData.role];
      router.replace(destination);
    }
  }, [authLoading, userData, router]);

  if (authLoading || userData) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
// EXPORTS ANTIGOS MANTIDOS COMO "ATALHOS"

export const ClientRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="client">{children}</ProtectedRoute>
);

export const OwnerRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="owner">{children}</ProtectedRoute>
);

export const ProfessionalRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => <ProtectedRoute role="professional">{children}</ProtectedRoute>;
