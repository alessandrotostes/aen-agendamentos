"use client";

import React from "react";
import EmptyState from "./common/EmptyState";
import { currencyUtils } from "../../lib/utils";
import type { Service } from "../../types";

// A interface de Props agora está mais simples
interface Props {
  services: Service[];
  createService: () => void;
  updateService: (id: string) => void;
  deleteService: (id: string) => void;
}

export default function ServicesTab({
  services,
  createService,
  updateService,
  deleteService,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="text-4xl mr-3">📋</span>
            Serviços
          </h2>
          <p className="text-teal-600 mt-1">
            Gerencie os serviços do seu estabelecimento
          </p>
        </div>
        <button
          onClick={createService}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-400 text-white rounded-xl hover:from-teal-600 hover:to-indigo-500 transition-all duration-200 hover:scale-105 shadow-lg font-medium flex items-center"
        >
          <svg
            className="w-5 h-5 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Novo Serviço</span>
        </button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-teal-100 hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.description}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-xl text-teal-600">
                    {currencyUtils.format(service.price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {service.duration} min
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => updateService(service.id)}
                  className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-teal-200 p-12">
          <EmptyState
            message="Ainda não há serviços cadastrados."
            icon="📋"
            actionText="Criar Primeiro Serviço"
            onAction={createService}
          />
        </div>
      )}
    </div>
  );
}
