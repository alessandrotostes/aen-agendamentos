"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation"; // Removido o 'AppRouterInstance'
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../owner/common/LoadingSpinner";

const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

// CORREÇÃO: Usamos o tipo inferido do próprio hook useRouter
const handleRedirect = (
  router: ReturnType<typeof useRouter>,
  pathname: string
) => {
  console.log("A guardar a rota de redirecionamento:", pathname);
  sessionStorage.setItem("redirectAfterLogin", pathname);
  router.push("/login");
};

export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !userData) {
      handleRedirect(router, pathname);
    } else if (!loading && userData && userData.role !== "client") {
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

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData) {
      let destination = "/client";
      if (userData.role === "owner") destination = "/owner";
      if (userData.role === "professional")
        destination = "/professional/dashboard";
      router.replace(destination);
    }
  }, [loading, userData, router]);

  if (loading || userData) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
