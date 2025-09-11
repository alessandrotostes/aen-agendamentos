//src/app/(auth)/register/page.tsx
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import AuthLayout from "../../../components/shared/AuthLayout";
import { validationUtils } from "../../../lib/utils";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "", //
    role: "client" as "client" | "owner",
    imageFile: null as File | null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, imageFile: files?.[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const validateForm = (): string | null => {
    if (!formData.firstName || !formData.lastName)
      return "Nome e sobrenome são obrigatórios.";
    if (!formData.email) return "Email é obrigatório.";
    if (!validationUtils.isValidEmail(formData.email)) return "Email inválido.";
    if (!formData.password) return "Senha é obrigatória.";
    if (formData.password.length < 6)
      return "Senha deve ter pelo menos 6 caracteres.";
    // ===== ALTERAÇÃO 1: TORNAR O TELEMÓVEL OBRIGATÓRIO =====
    if (!formData.phone) return "O número de telemóvel é obrigatório.";
    if (formData.role === "owner" && !formData.imageFile)
      return "A foto do estabelecimento é obrigatória.";
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
      // ===== ALTERAÇÃO 2: ENVIAR O TELEMÓVEL PARA A FUNÇÃO REGISTER =====
      const newUser = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role,
        formData.imageFile,
        formData.phone // Passando o telemóvel
      );

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
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Criar nova conta</h2>
        <p className="mt-2 text-sm text-gray-600">
          Ou{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            entrar na sua conta
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* O formulário agora tem dois campos para nome e sobrenome, lado a lado */}
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
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
              className="mt-1 block w-full px-3 py-2 border rounded-md"
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
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Telemóvel
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required // Tornando o campo obrigatório no HTML
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            placeholder="(XX) XXXXX-XXXX"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
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
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          >
            <option value="client">Cliente</option>
            <option value="owner">Estabelecimento</option>
          </select>
        </div>

        {formData.role === "owner" && (
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
              className="mt-1 block w-full text-sm"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registar"}
        </button>
      </form>
    </AuthLayout>
  );
}
