"use client";

import React, { useState, useMemo } from "react";
import EmptyState from "./common/EmptyState";
import Image from "next/image";
import type { Professional } from "../../types";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Send,
  Search,
  CheckCircle,
  Mail,
  X,
  Users,
  UserX,
} from "lucide-react";
// Importar o modal de confirmação
import ConfirmationModal from "../../components/shared/modals/ConfirmationModal";
// Imports para chamar a Cloud Function
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const ProfessionalCard = ({
  professional,
  onUpdate,
  onDelete,
  onManageAvailability,
  onInvite,
  onResendInvite,
}: {
  professional: Professional;
  onUpdate: () => void;
  onDelete: () => void;
  onManageAvailability: () => void;
  onInvite: () => void;
  onResendInvite: () => void;
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-indigo-200">
      <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
        <div className="relative w-16 h-16 shrink-0">
          <Image
            src={professional.photoURL || "/images/default-avatar.png"}
            alt={professional.firstName || "Foto do Profissional"}
            fill
            sizes="64px"
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900">
            {professional.firstName}
          </h3>
          {professional.authUid ? (
            <span className="mt-1 text-xs font-bold inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md">
              <CheckCircle className="w-3.5 h-3.5" /> Conectado
            </span>
          ) : (
            <span className="mt-1 text-xs font-bold inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-md">
              <Mail className="w-3.5 h-3.5" /> Convite Pendente
            </span>
          )}
        </div>
      </div>
      <div className="flex-grow py-4">
        {professional.bio && (
          <p className="text-sm text-slate-600 line-clamp-3 mb-3">
            {professional.bio}
          </p>
        )}
        {professional.specialties && professional.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {professional.specialties.map((s, idx) => (
              <span
                key={`${professional.id}-spec-${idx}`}
                className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          {!professional.authUid && professional.email ? (
            <button
              onClick={onInvite}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Convidar
            </button>
          ) : (
            <button
              onClick={onResendInvite}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reenviar
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onManageAvailability}
            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition"
            aria-label="Gerenciar horários"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={onUpdate}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
            aria-label="Editar profissional"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
            aria-label="Excluir profissional"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  professionals: Professional[];
  establishmentId: string;
  createProfessional: () => void;
  updateProfessional: (id: string) => void;
  onManageAvailability: (professional: Professional) => void;
  onInviteProfessional: (id: string) => void;
  onResendInvite: (id: string) => void;
  refreshProfessionals: () => void;
}

export default function ProfessionalsTab({
  professionals,
  establishmentId,
  createProfessional,
  updateProfessional,
  onManageAvailability,
  onInviteProfessional,
  onResendInvite,
  refreshProfessionals,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] =
    useState<Professional | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProfessionals = useMemo(() => {
    if (!searchTerm) {
      return professionals;
    }
    return professionals.filter((p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [professionals, searchTerm]);

  const openDeleteModal = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!professionalToDelete) return;

    setIsDeleting(true);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const deleteProfessional = httpsCallable(functions, "deleteProfessional");

      await deleteProfessional({
        establishmentId: establishmentId,
        professionalId: professionalToDelete.id,
      });

      alert(
        `Profissional ${professionalToDelete.firstName} excluído com sucesso.`
      );
      refreshProfessionals();
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      alert(
        "Não foi possível excluir o profissional. Verifique se ele não possui agendamentos futuros."
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProfessionalToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Profissionais
          </h2>
          <p className="text-slate-500 mt-1">Sua equipe de especialistas</p>
        </div>
        <button
          onClick={createProfessional}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          <span>Novo Profissional</span>
        </button>
      </div>

      {professionals.length > 0 && (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {filteredProfessionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((p) => (
            <ProfessionalCard
              key={p.id}
              professional={p}
              onUpdate={() => updateProfessional(p.id)}
              onDelete={() => openDeleteModal(p)}
              onManageAvailability={() => onManageAvailability(p)}
              onInvite={() => onInviteProfessional(p.id)}
              onResendInvite={() => onResendInvite(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12">
          {searchTerm && professionals.length > 0 ? (
            <EmptyState
              message={`Nenhum profissional encontrado para "${searchTerm}".`}
              icon={UserX}
            />
          ) : (
            <EmptyState
              message="Sua equipe ainda está vazia."
              icon={Users}
              actionText="Adicionar Primeiro Profissional"
              onAction={createProfessional}
            />
          )}
        </div>
      )}

      {professionalToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Excluir ${professionalToDelete.firstName}?`}
          message="Esta ação é permanente. Todos os dados do profissional serão removidos. Agendamentos futuros serão cancelados."
          confirmText="Sim, excluir profissional"
          type="danger"
          loading={isDeleting}
        />
      )}
    </div>
  );
}
