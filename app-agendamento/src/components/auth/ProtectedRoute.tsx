"use client";

import React from "react"; // Removido 'ReactNode' do import para corrigir o aviso
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
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

// Guardião para páginas que SÓ utilizadores 'professional' podem ver
export function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "professional") {
      router.push("/login");
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "professional") {
    return <AuthLoading />;
  }

  return <>{children}</>;
}

// Guardião para páginas que SÓ utilizadores NÃO LOGADOS podem ver
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && currentUser && userData) {
      const destination = userData.role === "owner" ? "/owner" : "/client";
      router.replace(destination);
    }
  }, [loading, currentUser, userData, router]);

  if (loading || currentUser) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
