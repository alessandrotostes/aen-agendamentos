"use client";

import React, { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Professional, CreateProfessionalData, Service } from "../../../types";

interface EditProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProfessionalData) => Promise<void>;
  professional?: Professional | null;
  allServices: Service[];
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function EditProfessionalModal({
  isOpen,
  onClose,
  onSave,
  professional,
  allServices,
}: EditProfessionalModalProps) {
  const isEdit = !!professional;

  const [formData, setFormData] = useState<CreateProfessionalData>({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    bio: "",
    serviceIds: [],
    imageFile: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (professional) {
        setFormData({
          name: professional.name,
          email: professional.email || "",
          phone: professional.phone || "",
          photoURL: professional.photoURL || "",
          bio: professional.bio || "",
          serviceIds: professional.serviceIds || [],
          imageFile: null,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          photoURL: "",
          bio: "",
          serviceIds: [],
          imageFile: null,
        });
      }
      setErrors({});
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

  const handleServiceSelection = (serviceId: string) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      // Opcional: Adicionar feedback de erro para o usuário aqui
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900"
                >
                  {isEdit ? "Editar Profissional" : "Novo Profissional"}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email (para convite)
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading || isEdit}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        } ${isEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="imageFile"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Foto
                    </label>
                    <input
                      type="file"
                      id="imageFile"
                      name="imageFile"
                      onChange={handleFileChange}
                      disabled={loading}
                      accept="image/png, image/jpeg"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700"
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
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Biografia
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serviços que realiza
                    </label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {allServices.length > 0 ? (
                        allServices.map((service) => (
                          <div key={service.id} className="flex items-center">
                            <input
                              id={`service-${service.id}`}
                              type="checkbox"
                              checked={formData.serviceIds.includes(service.id)}
                              onChange={() =>
                                handleServiceSelection(service.id)
                              }
                              className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`service-${service.id}`}
                              className="ml-3 block text-sm text-gray-800"
                            >
                              {service.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Nenhum serviço cadastrado. Adicione na aba
                          &quot;Serviços&quot;.
                        </p>
                      )}
                    </div>
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
                      {loading
                        ? "Salvando..."
                        : isEdit
                        ? "Salvar Alterações"
                        : "Criar Profissional"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
