"use client";

import React, { useState, useMemo } from "react";
import EmptyState from "./common/EmptyState";
import { currencyUtils } from "../../lib/utils";
import type { Service } from "../../types";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Search,
  X,
} from "lucide-react"; // Adicionado ícone X

// Componente ServiceCard (sem alterações)
const ServiceCard = ({
  service,
  onUpdate,
  onDelete,
}: {
  service: Service;
  onUpdate: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-teal-200">
      {/* Cabeçalho: Nome e Ações */}
      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-900 pr-4">
          {service.name}
        </h3>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onUpdate}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
            aria-label="Editar serviço"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
            aria-label="Excluir serviço"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corpo: Descrição */}
      <div className="flex-grow py-3">
        <p className="text-sm text-slate-600 line-clamp-3">
          {service.description}
        </p>
      </div>

      {/* Rodapé: Detalhes */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <DollarSign className="w-4 h-4" />
          <span>{currencyUtils.format(service.price)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <span>{service.duration} min</span>
        </div>
      </div>
    </div>
  );
};

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = useMemo(() => {
    if (!searchTerm) {
      return services;
    }
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

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
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-400 text-white rounded-xl hover:from-teal-600 hover:to-indigo-500 transition-all duration-200 hover:scale-105 shadow-lg font-medium flex items-center justify-center"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {services.length > 0 && (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
          {/* ========================================================== */}
          {/* ===== ALTERAÇÃO AQUI: BOTÃO DE LIMPAR BUSCA ============== */}
          {/* ========================================================== */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {/* ========================================================== */}
        </div>
      )}

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdate={() => updateService(service.id)}
              onDelete={() => deleteService(service.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-teal-200 p-12">
          {searchTerm && services.length > 0 ? (
            <EmptyState
              message={`Nenhum serviço encontrado para "${searchTerm}".`}
              icon="🤷"
            />
          ) : (
            <EmptyState
              message="Ainda não há serviços cadastrados."
              icon="📋"
              actionText="Criar Primeiro Serviço"
              onAction={createService}
            />
          )}
        </div>
      )}
    </div>
  );
}
