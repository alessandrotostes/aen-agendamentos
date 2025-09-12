"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../owner/common/LoadingSpinner";

// Componente de loading centralizado
const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Tipo para as roles permitidas
type UserRole = "client" | "owner" | "professional";

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  // 1. Usamos o novo 'authLoading' do nosso AuthContext
  const { userData, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 2. A lógica de redirecionamento SÓ RODA quando o loading da autenticação TERMINOU.
    if (!authLoading) {
      if (!userData) {
        // Se não há usuário, salva a rota atual e redireciona para o login
        console.log("Usuário não logado. Redirecionando para o login...");
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.push("/login");
      } else if (userData.role !== role) {
        // Se o usuário está logado mas tem a role errada, redireciona para o painel correto dele
        console.log(
          `Role incorreta. Usuário é '${userData.role}', rota exige '${role}'. Redirecionando...`
        );
        const destination = {
          owner: "/owner",
          client: "/client",
          professional: "/professional/dashboard",
        }[userData.role];
        router.push(destination);
      }
    }
  }, [authLoading, userData, router, pathname, role]);

  // 3. Lógica de renderização simplificada:
  // Se a autenticação ainda está carregando, mostramos o spinner.
  if (authLoading) {
    return <AuthLoading />;
  }

  // Se o loading terminou e o usuário tem a permissão correta, mostramos a página.
  if (userData && userData.role === role) {
    return <>{children}</>;
  }

  // Em todos os outros casos (sem usuário, role errada), não renderizamos nada,
  // pois o useEffect já está cuidando do redirecionamento. Isso evita o "flash".
  return null;
}

// ========================================================================
// ROTA PÚBLICA ATUALIZADA
// ========================================================================
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userData, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userData) {
      // Se o loading terminou e EXISTE um usuário, redireciona para fora da página pública
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
