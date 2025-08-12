// src/components/owner-dashboard/ServicesView.tsx
"use client";

import React from "react";
import { Service } from "@/types";

interface ServicesViewProps {
  services: Service[];
  serviceName: string;
  setServiceName: (value: string) => void;
  servicePrice: string;
  setServicePrice: (value: string) => void;
  serviceDuration: string;
  setServiceDuration: (value: string) => void;
  handleAddService: (e: React.FormEvent) => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export default function ServicesView({
  services,
  serviceName,
  setServiceName,
  servicePrice,
  setServicePrice,
  serviceDuration,
  setServiceDuration,
  handleAddService,
  onEdit,
  onDelete,
}: ServicesViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Adicionar Novo Serviço
          </h2>
          <form onSubmit={handleAddService} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="serviceName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="w-full mt-1 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="servicePrice"
                className="block text-sm font-medium text-gray-700"
              >
                Preço (R$)
              </label>
              <input
                type="number"
                id="servicePrice"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                required
                className="w-full mt-1 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="serviceDuration"
                className="block text-sm font-medium text-gray-700"
              >
                Duração (min)
              </label>
              <input
                type="number"
                id="serviceDuration"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                required
                className="w-full mt-1 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md"
            >
              Adicionar Serviço
            </button>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">Meus Serviços</h2>
          <div className="mt-4 space-y-3">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-md group"
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {service.duration} min
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-lg text-gray-900">
                      R$ {service.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => onEdit(service)}
                      className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"
                      title="Editar"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path
                          fillRule="evenodd"
                          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(service.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum serviço cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
