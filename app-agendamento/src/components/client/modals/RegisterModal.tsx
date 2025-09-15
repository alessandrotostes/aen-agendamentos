// src/components/client/modals/RegisterModal.tsx (VERSÃO COMPLETA FINAL)

"use client";

import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { type User as FirebaseUser } from "firebase/auth";
import { Phone, User, Mail, LockKeyhole, Building2 } from "lucide-react";
import { validationUtils } from "../../../lib/utils";

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

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterModalProps) {
  const { signInWithGoogle, registerWithEmail, updatePhoneNumber } = useAuth();

  const [step, setStep] = useState("register");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedPhone = validationUtils.formatPhone(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const { user, isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        setGoogleUser(user);
        setStep("phone_number");
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Falha ao entrar com Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationUtils.isValidPhone(formData.phone)) {
      setError(
        "Por favor, insira um número de telefone válido no formato (XX) XXXXX-XXXX."
      );
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
      });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível criar a conta.");
      }
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      await updatePhoneNumber(googleUser.uid, formData.phone);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível atualizar o telefone.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderInput = (
    name: keyof typeof formData,
    type: string,
    placeholder: string,
    Icon: React.ElementType,
    required = true
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
        required={required}
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
        className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        {step === "register" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              Crie uma conta para continuar
            </h3>
            <p className="text-center text-gray-500 text-sm mt-1">
              É rápido e fácil!
            </p>
            <div className="my-6 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                <span className="font-semibold text-gray-700">
                  Continuar com Google
                </span>
              </button>
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>
              <form onSubmit={handleEmailRegister} className="space-y-3">
                <div className="flex gap-3">
                  {renderInput("firstName", "text", "Nome", User)}
                  {renderInput("lastName", "text", "Sobrenome", Building2)}
                </div>
                {renderInput("email", "email", "E-mail", Mail)}
                {renderInput("phone", "tel", "Telefone (WhatsApp)", Phone)}
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
            </div>
          </div>
        )}
        {step === "phone_number" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              Só mais um passo!
            </h3>
            <p className="text-center text-gray-500 text-sm mt-1">
              Bem-vindo(a)! Precisamos do seu telefone para o agendamento.
            </p>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 mt-6">
              {renderInput("phone", "tel", "Seu Telefone (WhatsApp)", Phone)}
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
