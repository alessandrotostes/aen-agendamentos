// src/app/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
