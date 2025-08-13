"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import AuthLayout from "../../../components/shared/AuthLayout";
import { validationUtils } from "../../../lib/utils";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client" as "client" | "owner",
    imageFile: null as File | null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

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
    if (!formData.name) return "Nome é obrigatório.";
    if (!formData.email) return "Email é obrigatório.";
    if (!validationUtils.isValidEmail(formData.email)) return "Email inválido.";
    if (!formData.password) return "Senha é obrigatória.";
    if (formData.password.length < 6)
      return "Senha deve ter pelo menos 6 caracteres.";
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
    try {
      setError("");
      setLoading(true);
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.imageFile
      );
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

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border"
          />
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
            className="mt-1 block w-full px-3 py-2 border"
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
            className="mt-1 block w-full px-3 py-2 border"
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
            className="mt-1 block w-full px-3 py-2 border"
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
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Registrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
