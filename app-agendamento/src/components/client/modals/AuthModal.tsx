"use client";

import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { type User as FirebaseUser } from "firebase/auth";
import {
  Phone,
  User,
  Mail,
  LockKeyhole,
  Building2,
  FileText,
} from "lucide-react";
import { validationUtils } from "../../../lib/utils";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    {/* ... (código do ícone do Google permanece o mesmo) ... */}
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { login, signInWithGoogle, registerWithEmail, updateUserProfile } =
    useAuth();
  const [view, setView] = useState<"login" | "register" | "complete_google">(
    "login"
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    cpf: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "phone") formattedValue = validationUtils.formatPhone(value);
    if (name === "cpf") formattedValue = validationUtils.formatCPF(value);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (error) setError("");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      onSuccess();
    } catch {
      setError("E-mail ou senha inválidos. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const { user, isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        setGoogleUser(user);
        setView("complete_google");
      } else {
        onSuccess();
      }
    } catch (err) {
      if (
        err instanceof Error &&
        !err.message.includes("popup-closed-by-user")
      ) {
        setError("Falha ao entrar com Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validationUtils.isValidPhone(formData.phone) ||
      !validationUtils.isValidCPF(formData.cpf)
    ) {
      setError("Por favor, preencha um telefone e CPF válidos.");
      return;
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await registerWithEmail(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        cpf: formData.cpf,
      });
      onSuccess();
    } catch {
      setError(
        "Não foi possível criar a conta. O e-mail pode já estar em uso."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteGoogleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !googleUser ||
      !validationUtils.isValidPhone(formData.phone) ||
      !validationUtils.isValidCPF(formData.cpf)
    ) {
      setError("Por favor, preencha um telefone e CPF válidos.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await updateUserProfile(googleUser.uid, {
        phone: formData.phone,
        cpf: formData.cpf,
        profileStatus: "complete",
      });
      onSuccess();
    } catch (err) {
      console.error("AuthModal: Erro ao completar perfil do Google", err);
      setError("Não foi possível salvar os seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderInput = (
    name: keyof typeof formData,
    type: string,
    placeholder: string,
    Icon: React.ElementType
  ) => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        name={name}
        type={type}
        onChange={handleInputChange}
        value={formData[name]}
        placeholder={placeholder}
        required
        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        {view === "login" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              Entre para continuar
            </h3>
            <p className="text-center text-gray-500 text-sm mt-1">
              Bem-vindo(a) de volta!
            </p>
            <div className="my-6 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <GoogleIcon />
                <span className="font-semibold text-gray-700">
                  Continuar com Google
                </span>
              </button>
              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                {renderInput("email", "email", "E-mail", Mail)}
                {renderInput("password", "password", "Senha", LockKeyhole)}
                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  onClick={() => setView("register")}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Crie uma agora
                </button>
              </p>
            </div>
          </div>
        )}

        {view === "register" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              Crie uma conta para continuar
            </h3>
            <p className="text-center text-gray-500 text-sm mt-1">
              É rápido e fácil!
            </p>
            <form onSubmit={handleEmailRegister} className="space-y-3 mt-6">
              <div className="flex gap-3">
                {renderInput("firstName", "text", "Nome", User)}
                {renderInput("lastName", "text", "Sobrenome", Building2)}
              </div>
              {renderInput("email", "email", "E-mail", Mail)}
              {renderInput("phone", "tel", "Telefone (WhatsApp)", Phone)}
              {renderInput("cpf", "tel", "CPF", FileText)}
              {renderInput(
                "password",
                "password",
                "Crie uma senha",
                LockKeyhole
              )}
              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
              >
                {isLoading ? "Criando..." : "Criar Conta"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              Já tem uma conta?{" "}
              <button
                onClick={() => setView("login")}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Entre aqui
              </button>
            </p>
          </div>
        )}

        {view === "complete_google" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              Só mais um passo!
            </h3>
            <p className="text-center text-gray-500 text-sm mt-1">
              Complete seu cadastro para continuar.
            </p>
            <form
              onSubmit={handleCompleteGoogleSignUp}
              className="space-y-4 mt-6"
            >
              {renderInput("phone", "tel", "Seu Telefone (WhatsApp)", Phone)}
              {renderInput("cpf", "tel", "CPF", FileText)}
              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
              >
                {isLoading ? "Salvando..." : "Salvar e Continuar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
