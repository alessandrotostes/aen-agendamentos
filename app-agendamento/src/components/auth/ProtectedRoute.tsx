"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../owner/common/LoadingSpinner";

const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Função auxiliar para guardar a rota de redirecionamento
const handleRedirect = (router: any, pathname: string) => {
  console.log("A guardar a rota de redirecionamento:", pathname);
  // Usamos sessionStorage para guardar a URL que o utilizador queria aceder
  sessionStorage.setItem("redirectAfterLogin", pathname);
  router.push("/login");
};

// Guardião para páginas que SÓ utilizadores 'client' podem ver
export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !userData) {
      // Se não estiver logado, guarda a rota e redireciona
      handleRedirect(router, pathname);
    } else if (!loading && userData && userData.role !== "client") {
      // Se estiver logado mas não for cliente, envia para a página do seu role
      const destination =
        userData.role === "owner" ? "/owner" : "/professional/dashboard";
      router.push(destination);
    }
  }, [loading, userData, router, pathname]);

  if (loading || !userData || userData.role !== "client") {
    return <AuthLoading />;
  }
  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores 'owner' podem ver
export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !userData) {
      handleRedirect(router, pathname);
    } else if (!loading && userData && userData.role !== "owner") {
      const destination =
        userData.role === "client" ? "/client" : "/professional/dashboard";
      router.push(destination);
    }
  }, [loading, userData, router, pathname]);

  if (loading || !userData || userData.role !== "owner") {
    return <AuthLoading />;
  }
  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores 'professional' podem ver
export function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !userData) {
      handleRedirect(router, pathname);
    } else if (!loading && userData && userData.role !== "professional") {
      const destination = userData.role === "owner" ? "/owner" : "/client";
      router.push(destination);
    }
  }, [loading, userData, router, pathname]);

  if (loading || !userData || userData.role !== "professional") {
    return <AuthLoading />;
  }

  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores NÃO LOGADOS podem ver (ex: login, registo)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData) {
      // Se o utilizador já está logado, envia para o seu respetivo painel
      let destination = "/client";
      if (userData.role === "owner") destination = "/owner";
      if (userData.role === "professional")
        destination = "/professional/dashboard";
      router.replace(destination);
    }
  }, [loading, userData, router]);

  // Enquanto carrega ou se já estiver logado, mostra o spinner
  if (loading || userData) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
