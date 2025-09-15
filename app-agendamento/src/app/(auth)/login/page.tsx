"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { validationUtils } from "../../../lib/utils";
import AuthLayout from "../../../components/shared/AuthLayout";
import {
  AlertTriangle,
  LockKeyhole,
  Phone,
  Building,
  User,
  Briefcase,
} from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import type { AuthUser } from "../../../types";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.409,44,28.232,44,20C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { login, signInWithGoogle, updatePhoneNumber } = useAuth();

  const [step, setStep] = useState<"login" | "phone_number">("login");
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [showTestLogins, setShowTestLogins] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numbers = value.replace(/\D/g, "").slice(0, 11);
      let formattedPhone = numbers;
      if (numbers.length > 10) {
        formattedPhone = `(${numbers.slice(0, 2)}) ${numbers.slice(
          2,
          7
        )}-${numbers.slice(7)}`;
      } else if (numbers.length > 6) {
        formattedPhone = `(${numbers.slice(0, 2)}) ${numbers.slice(
          2,
          6
        )}-${numbers.slice(6)}`;
      } else if (numbers.length > 2) {
        formattedPhone = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 0) {
        formattedPhone = `(${numbers}`;
      }
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const handleRedirect = (user: AuthUser) => {
    const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectUrl);
    } else {
      let destination = "/client";
      if (user.role === "owner") destination = "/owner";
      if (user.role === "professional") destination = "/professional/dashboard";
      router.push(destination);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationUtils.isValidEmail(formData.email) || !formData.password) {
      setError("Por favor, preencha e-mail e senha válidos.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const loggedInUserData = await login(formData.email, formData.password);
      handleRedirect(loggedInUserData);
    } catch (err: unknown) {
      console.error("Falha no login por e-mail:", err);
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { user, isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        setGoogleUser(user);
        setStep("phone_number");
      } else {
        const tempUserData = {
          uid: user.uid,
          email: user.email || "",
          role: "client",
        } as AuthUser;
        handleRedirect(tempUserData);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (!err.message.includes("popup-closed-by-user")) {
          setError("Falha ao entrar com Google. Tente novamente.");
        }
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationUtils.isValidPhone(formData.phone)) {
      setError(
        "Por favor, insira um número de telefone válido no formato (XX) XXXXX-XXXX."
      );
      return;
    }
    if (!googleUser) return;
    setError("");
    setLoading(true);
    try {
      await updatePhoneNumber(googleUser.uid, formData.phone);
      const tempUserData = {
        uid: googleUser.uid,
        email: googleUser.email || "",
        role: "client",
      } as AuthUser;
      handleRedirect(tempUserData);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Não foi possível guardar o telefone.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (email: string, pass: string) => {
    setError("");
    setLoading(true);
    try {
      const loggedInUserData = await login(email, pass);
      handleRedirect(loggedInUserData);
    } catch (err: unknown) {
      console.error("Falha no login de teste:", err);
      setError("Falha no login de teste. Verifique as credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        {step === "login" ? (
          <>
            <div className="text-center mb-8">
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
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            <div className="mt-4 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                <span className="font-semibold text-gray-700">
                  Continuar com Google
                </span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    ou continue com
                  </span>
                </div>
              </div>
              <form
                onSubmit={handleSubmitEmail}
                className="space-y-4"
                suppressHydrationWarning={true}
              >
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    suppressHydrationWarning={true}
                  />
                </div>

                {/* ALTERAÇÃO AQUI: Link para redefinir senha adicionado de volta */}
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
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    suppressHydrationWarning={true}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            </div>

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
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Building className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    Estabelecimento
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleTestLogin("aencliente@gmail.com", "aenteste123")
                    }
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <User className="w-5 h-5 text-indigo-500" />
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleTestLogin("aenteste@gmail.com", "aenteste123")
                    }
                    disabled={loading}
                    className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    Colaborador
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-indigo-50 rounded-full mb-4">
                <Phone className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Só mais um passo!
              </h2>
              <p className="text-center text-gray-500 text-sm mt-1">
                Precisamos do seu telefone para concluir o seu registo.
              </p>
            </div>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 mt-6">
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Seu Telefone (WhatsApp)"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
              >
                {loading ? "Salvando..." : "Guardar e Continuar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
