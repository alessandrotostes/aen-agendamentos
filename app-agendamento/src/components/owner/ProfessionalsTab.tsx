"use client";

import React from "react";
import EmptyState from "./common/EmptyState";
import Image from "next/image";
import type { Professional } from "../../types";

interface Props {
  professionals: Professional[];
  createProfessional: () => void;
  updateProfessional: (id: string) => void;
  deleteProfessional: (id: string) => void;
  onManageAvailability: (professional: Professional) => void;
  onInviteProfessional: (id: string) => void;
  onResendInvite: (id: string) => void;
}

export default function ProfessionalsTab({
  professionals,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  onManageAvailability,
  onInviteProfessional,
  onResendInvite,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="text-4xl mr-3">👨‍💼</span>
            Profissionais
          </h2>
          <p className="text-teal-600 mt-1">Sua equipe de especialistas</p>
        </div>
        <button
          onClick={createProfessional}
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
          <span>Novo Profissional</span>
        </button>
      </div>

      {professionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((p) => (
            <div
              key={p.id}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group flex flex-col"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={p.photoURL || "/images/default-avatar.png"}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-100 group-hover:ring-indigo-200 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                  {p.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                      {p.bio}
                    </p>
                  )}
                </div>
              </div>

              {p.specialties && p.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {p.specialties.slice(0, 3).map((s, idx) => (
                      <span
                        key={`${p.id}-spec-${idx}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-teal-100 to-indigo-100 text-teal-700"
                      >
                        {s}
                      </span>
                    ))}
                    {p.specialties.length > 3 && (
                      <span className="text-xs text-teal-600 font-medium px-2 py-1 bg-teal-50 rounded-full">
                        +{p.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {p.authUid ? (
                <span className="mb-4 text-xs font-bold inline-flex items-center self-start px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">
                  ✔️ Convidado
                </span>
              ) : (
                <span className="mb-4 text-xs font-bold inline-flex items-center self-start px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">
                  ✉️ Convite Pendente
                </span>
              )}

              <div className="mt-auto pt-4 border-t flex justify-end space-x-2">
                {!p.authUid && p.email && (
                  <button
                    onClick={() => onInviteProfessional(p.id)}
                    className="px-3 py-1 text-xs font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg"
                  >
                    Convidar
                  </button>
                )}
                {p.authUid && (
                  <button
                    onClick={() => onResendInvite(p.id)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Reenviar Convite
                  </button>
                )}
                <button
                  onClick={() => onManageAvailability(p)}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Horários
                </button>
                <button
                  onClick={() => updateProfessional(p.id)}
                  className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteProfessional(p.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-indigo-200 p-12">
          <EmptyState
            message="Sua equipe ainda está vazia."
            icon="👨‍💼"
            actionText="Adicionar Primeiro Profissional"
            onAction={createProfessional}
          />
        </div>
      )}
    </div>
  );
}
