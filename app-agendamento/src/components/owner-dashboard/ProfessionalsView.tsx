// src/components/owner-dashboard/ProfessionalsView.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Professional, Service } from "@/types";

interface ProfessionalsViewProps {
  professionals: Professional[];
  services: Service[];
  professionalName: string;
  setProfessionalName: (value: string) => void;
  selectedServices: string[];
  handleServiceSelection: (serviceId: string) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddProfessional: (e: React.FormEvent) => void;
  onEdit: (prof: Professional) => void;
  onDelete: (profId: string) => void;
  onManageAvailability: (prof: Professional) => void;
}

export default function ProfessionalsView({
  professionals,
  services,
  professionalName,
  setProfessionalName,
  selectedServices,
  handleServiceSelection,
  handlePhotoChange,
  handleAddProfessional,
  onEdit,
  onDelete,
  onManageAvailability,
}: ProfessionalsViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Adicionar Profissional
          </h2>
          <form onSubmit={handleAddProfessional} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="profName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                type="text"
                id="profName"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                required
                className="w-full mt-1 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="profPhoto"
                className="block text-sm font-medium text-gray-700"
              >
                Foto
              </label>
              <input
                type="file"
                id="profPhoto"
                onChange={handlePhotoChange}
                accept="image/png, image/jpeg"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Serviços
              </label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      id={`s-${service.id}`}
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceSelection(service.id)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                    <label
                      htmlFor={`s-${service.id}`}
                      className="ml-3 block text-sm"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md"
            >
              Adicionar
            </button>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Meus Profissionais
          </h2>
          <div className="mt-4 space-y-4">
            {professionals.length > 0 ? (
              professionals.map((p) => {
                const profServices = services.filter((s) =>
                  p.serviceIds.includes(s.id)
                );
                return (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <>
                            {p.photoURL ? (
                              <Image
                                src={p.photoURL}
                                alt={p.name}
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded-full object-cover mr-4"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 flex items-center justify-center mr-4 shrink-0">
                                <span className="text-2xl font-bold text-white">
                                  {p.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </>
                          <p className="font-semibold text-gray-900">
                            {p.name}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 ml-16">
                          {profServices.map((s) => (
                            <span
                              key={s.id}
                              className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => onEdit(p)} title="Editar">
                          <svg />
                        </button>
                        <button onClick={() => onDelete(p.id)} title="Excluir">
                          <svg />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onManageAvailability(p)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-800"
                      >
                        Gerenciar Horários
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">Nenhum profissional cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
