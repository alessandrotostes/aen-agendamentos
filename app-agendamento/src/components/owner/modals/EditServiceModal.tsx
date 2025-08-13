"use client";

import React, { useState, useEffect } from "react";
import { Service, CreateServiceData } from "../../../types";
import { validationUtils, currencyUtils } from "../../../lib/utils";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceData) => Promise<void>;
  service?: Service | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  duration?: string;
}

export default function EditServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
}: EditServiceModalProps) {
  const isEdit = !!service;

  // Estado do formulário
  const [formData, setFormData] = useState<CreateServiceData>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Reset form quando modal abre/fecha ou service muda
  useEffect(() => {
    if (isOpen) {
      if (service) {
        // Edição - preencher com dados existentes
        setFormData({
          name: service.name,
          description: service.description || "",
          price: service.price,
          duration: service.duration,
        });
      } else {
        // Criação - formulário limpo
        setFormData({
          name: "",
          description: "",
          price: 0,
          duration: 30,
        });
      }
      setErrors({});
    }
  }, [isOpen, service]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose, loading]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Limpar erro do campo quando usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "duration"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome obrigatório
    if (!formData.name.trim()) {
      newErrors.name = "Nome do serviço é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    // Preço
    if (formData.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    } else if (!validationUtils.isValidPrice(formData.price)) {
      newErrors.price = "Preço deve estar entre R$ 0,01 e R$ 10.000,00";
    }

    // Duração
    if (formData.duration <= 0) {
      newErrors.duration = "Duração deve ser maior que zero";
    } else if (!validationUtils.isValidDuration(formData.duration)) {
      newErrors.duration = "Duração deve estar entre 15 e 480 minutos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSave(formData);
      // Modal será fechado pelo componente pai após sucesso
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      // Erro será tratado pelo componente pai
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar Serviço" : "Novo Serviço"}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome do Serviço */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome do Serviço *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Ex: Corte Masculino"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Descreva os detalhes do serviço..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Grid para Preço e Duração */}
          <div className="grid grid-cols-2 gap-4">
            {/* Preço */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preço (R$) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                disabled={loading}
                min="0.01"
                max="10000"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.price ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0,00"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
              {/* Preview do preço formatado */}
              {formData.price > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {currencyUtils.format(formData.price)}
                </p>
              )}
            </div>

            {/* Duração */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duração (min) *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.duration ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
                <option value={150}>2h 30min</option>
                <option value={180}>3 horas</option>
                <option value={240}>4 horas</option>
              </select>
              {errors.duration && (
                <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  />
                </svg>
              )}
              <span>
                {loading
                  ? "Salvando..."
                  : isEdit
                  ? "Salvar Alterações"
                  : "Criar Serviço"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
