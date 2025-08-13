"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [loading, currentUser, router]);

  if (loading || !currentUser) return null;
  return <>{children}</>;
}

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "owner") {
      router.push("/");
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "owner") return null;
  return <>{children}</>;
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && userData?.role !== "client") {
      router.push("/");
    }
  }, [loading, userData, router]);

  if (loading || userData?.role !== "client") return null;
  return <>{children}</>;
}
