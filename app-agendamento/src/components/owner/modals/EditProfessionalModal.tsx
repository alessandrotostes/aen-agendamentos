"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// CORREÇÃO: Caminho de importação ajustado
import { Professional, CreateProfessionalData } from "../../../types";

interface EditProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProfessionalData) => Promise<void>;
  professional?: Professional | null;
}

interface FormErrors {
  name?: string;
}

export default function EditProfessionalModal({
  isOpen,
  onClose,
  onSave,
  professional,
}: EditProfessionalModalProps) {
  const isEdit = !!professional;
  const [formData, setFormData] = useState<CreateProfessionalData>({
    name: "",
    photoURL: "",
    bio: "",
    specialties: [],
    imageFile: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (professional) {
        setFormData({
          name: professional.name,
          photoURL: professional.photoURL || "",
          bio: professional.bio || "",
          specialties: professional.specialties || [],
          imageFile: null,
        });
      } else {
        setFormData({
          name: "",
          photoURL: "",
          bio: "",
          specialties: [],
          imageFile: null,
        });
      }
      setErrors({});
      setSpecialtyInput("");
    }
  }, [isOpen, professional]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };
  const addSpecialty = () => {
    const specialty = specialtyInput.trim();
    if (specialty && !formData.specialties?.includes(specialty)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty],
      }));
      setSpecialtyInput("");
    }
  };
  const removeSpecialty = (specialtyToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties:
        prev.specialties?.filter((s) => s !== specialtyToRemove) || [],
    }));
  };
  const handleSpecialtyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecialty();
    }
  };
  const validateForm = () => {
    /* ... */ return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar Profissional" : "Novo Profissional"}
          </h3>
          <button onClick={onClose} disabled={loading}>
            <svg />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full ... ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="imageFile">Foto</label>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              onChange={handleFileChange}
              disabled={loading}
              accept="image/png, image/jpeg"
            />
            {(formData.imageFile || formData.photoURL) && (
              <div className="mt-2">
                <Image
                  src={
                    formData.imageFile
                      ? URL.createObjectURL(formData.imageFile)
                      : formData.photoURL!
                  }
                  alt="Preview"
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="bio">Biografia</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
          </div>
          <div>
            <label>Especialidades</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyPress={handleSpecialtyKeyPress}
                disabled={loading}
              />
              <button
                type="button"
                onClick={addSpecialty}
                disabled={loading || !specialtyInput.trim()}
              >
                +
              </button>
            </div>
            {formData.specialties && formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map(
                  (specialty: string, index: number) => (
                    <span key={index} className="inline-flex items-center ...">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        disabled={loading}
                      >
                        <svg />
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : isEdit
                ? "Salvar Alterações"
                : "Criar Profissional"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
