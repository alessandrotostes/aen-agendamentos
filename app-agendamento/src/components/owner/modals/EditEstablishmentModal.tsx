"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Establishment, UpdateEstablishmentData } from "../../../types";
import InfoTooltip from "@/components/shared/InfoTooltip";
// Alteração 1: Importar um ícone para o campo CNPJ
import { Building } from "lucide-react";

interface EditEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateEstablishmentData) => Promise<void>;
  establishment?: Establishment | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  imageURL?: string;
  mainService?: string;
  instagram?: string;
}

export default function EditEstablishmentModal({
  isOpen,
  onClose,
  onSave,
  establishment,
}: EditEstablishmentModalProps) {
  const [formData, setFormData] = useState<UpdateEstablishmentData>({
    name: "",
    // Alteração 2: Adicionar o CNPJ ao estado inicial do formulário
    cnpj: "",
    description: "",
    address: "",
    phone: "",
    imageURL: "",
    mainService: "",
    imageFile: null,
    socialLinks: {
      instagram: "",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && establishment) {
      setFormData({
        name: establishment.name || "",
        // Alteração 3: Popular o CNPJ a partir dos dados do estabelecimento
        cnpj: establishment.cnpj || "",
        description: establishment.description || "",
        address: establishment.address || "",
        phone: establishment.phone || "",
        imageURL: establishment.imageURL || "",
        mainService: establishment.mainService || "",
        imageFile: null,
        socialLinks: {
          instagram: establishment.socialLinks?.instagram || "",
        },
      });
      setErrors({});
    }
  }, [isOpen, establishment]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "instagram") {
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          instagram: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // A função onSave já recebe o formData completo, não precisa de alterações aqui.
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Estabelecimento
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome do Estabelecimento *
              <InfoTooltip>
                A Url do seu estabelecimento será gerada automaticamente a
                partir deste nome. Não utilize Caractéres Especiais (Ex: @, #,
                $, %, &, *, etc) pois os navegadores não aceitam estes
                caracteres em URLs.
              </InfoTooltip>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Alteração 4: Adicionar o campo CNPJ não editável */}
          <div>
            <label
              htmlFor="cnpj"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CNPJ
              <InfoTooltip>
                Caso seja necessário alterar o CNPJ contate o suporte através do
                nÚmero: (16) 99764-3604
              </InfoTooltip>
            </label>
            <div className="relative">
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj || ""}
                disabled // Campo desabilitado para edição
                className="w-full pl-3 pr-10 py-2 border rounded-lg shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          {/* Fim da Alteração 4 */}

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
              value={formData.description || ""}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefone *
                <InfoTooltip>
                  Informe o DDD corretamente. Este será o telefone de contato
                  para seus clientes.
                </InfoTooltip>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instagram
                <InfoTooltip>
                  Copie e cole a URL completa do seu perfil. Ex:
                  https://www.instagram.com/seunegocio
                </InfoTooltip>
              </label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                value={formData.socialLinks?.instagram || ""}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300"
                placeholder="https://www.instagram.com/..."
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Endereço Completo *
              <InfoTooltip>
                Forneça o endereço completo do estabelecimento, incluindo rua,
                número, bairro, cidade e CEP, para que seus clientes possam
                encontrá-lo utilizando serviços de mapas e navegação. (Se
                preferir, utilize o Google Maps para gerar o endereço exato).
              </InfoTooltip>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                errors.address ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="mainService"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Serviço Principal
              <InfoTooltip>
                É importante definir o serviço principal para que futuramente o
                cliente possa filtrar os estabelecimentos por este serviço. Ex:
                Barbearia, Salão de Beleza, Estética, etc.
              </InfoTooltip>
            </label>
            <select
              id="mainService"
              name="mainService"
              value={formData.mainService || ""}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            >
              <option value="">Selecione...</option>
              <option value="Barbearia">Barbearia</option>
              <option value="Salão de Beleza">Salão de Beleza</option>
              <option value="Estética">Estética</option>
              <option value="Nail Designer">Nail Designer</option>
              <option value="Manicure e Pedicure">Manicure e Pedicure</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="imageFile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Foto do Estabelecimento: <br /> Utilize uma imagem (.png) sem
              fundo para melhor resultado.
            </label>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              onChange={handleFileChange}
              disabled={loading}
              accept="image/png, image/jpeg"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {(formData.imageFile || formData.imageURL) && (
              <div className="mt-2">
                <Image
                  src={
                    formData.imageFile
                      ? URL.createObjectURL(formData.imageFile)
                      : formData.imageURL!
                  }
                  alt="Preview"
                  width={120}
                  height={80}
                  className="rounded-lg object-cover shadow-sm"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
