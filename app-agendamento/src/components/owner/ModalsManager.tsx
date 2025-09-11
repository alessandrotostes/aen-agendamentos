"use client";

import React from "react";
import EditServiceModal from "./modals/EditServiceModal";
import EditProfessionalUnifiedModal from "./modals/EditProfessionalUnifiedModal";
import EditEstablishmentModal from "./modals/EditEstablishmentModal";
import OperatingHoursModal from "./modals/OperatingHoursModal";
import ConfirmationModal from "../shared/modals/ConfirmationModal";
import SuccessModal from "../shared/modals/SuccessModal";
import type {
  Service,
  Professional,
  Establishment,
  CreateServiceData,
  CreateProfessionalData,
  UpdateEstablishmentData,
  OperatingHours,
  Availability,
} from "../../types";

type UnifiedProfessionalData = CreateProfessionalData & {
  availability?: Availability;
};

// ==========================================================
// ===== ALTERAÇÃO 1: ADICIONADA A NOVA PROP 'initialView' ====
// ==========================================================
interface ModalsManagerProps {
  isServiceOpen: boolean;
  isProfessionalUnifiedOpen: boolean;
  isEstablishmentOpen: boolean;
  isOperatingHoursOpen: boolean;
  isDeleteConfirmOpen: boolean;
  isSuccessOpen: boolean;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  initialView: "details" | "availability"; // <-- ADICIONADO AQUI
  establishmentToEdit: Establishment | null;
  deleteTarget: {
    type: "service" | "professional";
    id: string;
    name: string;
  } | null;
  successMessage: string;
  allServices: Service[];
  onCloseService: () => void;
  onCloseProfessionalUnified: () => void;
  onCloseEstablishment: () => void;
  onCloseOperatingHours: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseSuccess: () => void;
  onConfirmDelete: () => Promise<void>;
  onSaveService: (data: CreateServiceData) => Promise<void>;
  onSaveProfessional: (data: UnifiedProfessionalData) => Promise<void>;
  onSaveEstablishment: (data: UpdateEstablishmentData) => Promise<void>;
  onSaveOperatingHours: (hours: OperatingHours) => Promise<void>;
}

export default function ModalsManager({
  isServiceOpen,
  isProfessionalUnifiedOpen,
  isEstablishmentOpen,
  isOperatingHoursOpen,
  isDeleteConfirmOpen,
  isSuccessOpen,
  selectedService,
  selectedProfessional,
  initialView, // <-- ALTERAÇÃO 2: RECEBIDA A PROP
  establishmentToEdit,
  deleteTarget,
  successMessage,
  allServices,
  onCloseService,
  onCloseProfessionalUnified,
  onCloseEstablishment,
  onCloseOperatingHours,
  onCloseDeleteConfirm,
  onCloseSuccess,
  onConfirmDelete,
  onSaveService,
  onSaveProfessional,
  onSaveEstablishment,
  onSaveOperatingHours,
}: ModalsManagerProps) {
  return (
    <>
      <EditServiceModal
        isOpen={isServiceOpen}
        onClose={onCloseService}
        onSave={onSaveService}
        service={selectedService}
      />

      <EditProfessionalUnifiedModal
        isOpen={isProfessionalUnifiedOpen}
        onClose={onCloseProfessionalUnified}
        onSave={onSaveProfessional}
        professional={selectedProfessional}
        allServices={allServices}
        initialView={initialView} // <-- ALTERAÇÃO 3: PROP PASSADA PARA O MODAL
      />

      <EditEstablishmentModal
        isOpen={isEstablishmentOpen}
        onClose={onCloseEstablishment}
        onSave={onSaveEstablishment}
        establishment={establishmentToEdit}
      />

      <OperatingHoursModal
        isOpen={isOperatingHoursOpen}
        onClose={onCloseOperatingHours}
        onSave={onSaveOperatingHours}
        establishment={establishmentToEdit}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title={`Excluir ${
          deleteTarget?.type === "service" ? "Serviço" : "Profissional"
        }`}
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={onCloseSuccess}
        title="Sucesso!"
        message={successMessage}
      />
    </>
  );
}
