"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, RegisterFormData } from "../../../contexts/AuthContext";
import AuthLayout from "../../../components/shared/AuthLayout";
import { validationUtils } from "../../../lib/utils";
import PasswordStrengthIndicator from "../../../components/shared/PasswordStrengthIndicator";
// 1. IMPORTAR OS NOVOS ÍCONES
import { AlertTriangle, UserPlus, Eye, EyeOff } from "lucide-react";

const initialPasswordValidation = {
  minLength: false,
  lowercase: false,
  uppercase: false,
  number: false,
  specialChar: false,
};

const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function RegisterPage() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<
    Omit<RegisterFormData, "password" | "email"> & { email: string }
  >({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "client",
    imageFile: null,
    cpf: "",
    cnpj: "",
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(
    initialPasswordValidation
  );
  // 2. ADICIONAR O ESTADO DE VISIBILIDADE DA SENHA
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "phone") {
      formattedValue = validationUtils.formatPhone(value);
    } else if (name === "cpf") {
      formattedValue = validationUtils.formatCPF(value);
    } else if (name === "cnpj") {
      formattedValue = validationUtils.formatCNPJ(value);
    } else if (name === "image") {
      const files = (e.target as HTMLInputElement).files;
      setFormData((prev) => ({ ...prev, imageFile: files?.[0] || null }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validation = validationUtils.validatePasswordStrength(newPassword);
    setPasswordValidation(validation);
    if (error) setError("");
  };

  const validateForm = (): string | null => {
    if (!formData.firstName || !formData.lastName)
      return "Nome e sobrenome são obrigatórios.";
    if (!validationUtils.isValidEmail(formData.email)) return "Email inválido.";

    const passwordCheck = validationUtils.validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return "A senha não cumpre todos os requisitos de segurança.";
    }

    if (!formData.phone) return "O número de telefone é obrigatório.";

    if (formData.role === "client") {
      if (!formData.cpf) return "O CPF é obrigatório.";
      if (!validationUtils.isValidCPF(formData.cpf)) return "CPF inválido.";
    }

    if (formData.role === "owner") {
      if (!formData.cnpj) return "O CNPJ é obrigatório.";
      if (!validationUtils.isValidCNPJ(formData.cnpj)) return "CNPJ inválido.";
      if (!formData.imageFile)
        return "A foto do estabelecimento é obrigatória.";
    }

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
      const newUser = await register({ ...formData, password });

      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        const destination = newUser.role === "owner" ? "/owner" : "/client";
        router.push(destination);
      }
    } catch (err: unknown) {
      console.error("Erro no registro:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "auth/email-already-in-use"
      ) {
        setError(
          "Este email já está em uso. Faça login ou redefina sua senha."
        );
      } else {
        setError(err instanceof Error ? err.message : "Erro ao registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-50 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crie a sua conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Entre aqui
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Sobrenome
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          {/* --- 3. CAMPO DE SENHA ATUALIZADO --- */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <PasswordStrengthIndicator validation={passwordValidation} />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Sou
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="client">Cliente</option>
              <option value="owner">Estabelecimento</option>
            </select>
          </div>

          {formData.role === "client" && (
            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-700"
              >
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="000.000.000-00"
              />
            </div>
          )}

          {formData.role === "owner" && (
            <>
              <div>
                <label
                  htmlFor="cnpj"
                  className="block text-sm font-medium text-gray-700"
                >
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Foto do Estabelecimento
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading && <SpinnerIcon />}
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
