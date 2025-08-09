import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importe o AuthProvider
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App de Agendamento",
  description: "Agende seus horários de forma fácil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* Envolva os 'children' com o AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
