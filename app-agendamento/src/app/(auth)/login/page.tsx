"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { validationUtils } from "../../../lib/utils";
import AuthLayout from "../../../components/shared/AuthLayout"; // Mantemos o AuthLayout
// Importando ícones para a nova interface
import {
  AlertTriangle,
  Building,
  User,
  Briefcase,
  LockKeyhole,
} from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTestLogins, setShowTestLogins] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = (): string | null => {
    if (!formData.email) return "O e-mail é obrigatório.";
    if (!validationUtils.isValidEmail(formData.email))
      return "O e-mail é inválido.";
    if (!formData.password) return "A senha é obrigatória.";
    if (formData.password.length < 6)
      return "A senha deve ter pelo menos 6 caracteres.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");

      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        let destination = "/client";
        if (userData.role === "owner") destination = "/owner";
        if (userData.role === "professional")
          destination = "/professional/dashboard";
        router.push(destination);
      }
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      if (err instanceof Error && "code" in err) {
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          errorMessage = "E-mail ou senha inválidos.";
        }
      }
      console.error("Erro no login:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (email: string, pass: string) => {
    setFormData({ email: email, password: pass });
    setTimeout(() => {
      (
        document.getElementById("login-form") as HTMLFormElement
      )?.requestSubmit();
    }, 100);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          {/* Ícone de Cabeçalho para adicionar identidade visual */}
          <div className="inline-block p-3 bg-indigo-50 rounded-full mb-4">
            <LockKeyhole className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          <div className="pt-4 text-center">
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowTestLogins(!showTestLogins)}
                  className="px-2 bg-white text-gray-500 font-medium"
                >
                  Acesso rápido para teste {showTestLogins ? "⏶" : "⏷"}
                </button>
              </div>
            </div>

            {showTestLogins && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleTestLogin(
                      "aenestabelecimento@gmail.com",
                      "aenteste123"
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <Building className="w-5 h-5 text-indigo-500" />
                  Estabelecimento
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTestLogin("aencliente@gmail.com", "aenteste123")
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <User className="w-5 h-5 text-indigo-500" />
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTestLogin("aenteste@gmail.com", "aenteste123")
                  }
                  className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Colaborador
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
