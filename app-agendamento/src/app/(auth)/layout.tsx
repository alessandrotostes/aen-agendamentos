import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação - All & None",
  description: "Login e registro no sistema de agendamento",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
