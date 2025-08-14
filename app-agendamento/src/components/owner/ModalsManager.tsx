"use client";

import React from "react";
import EditServiceModal from "./modals/EditServiceModal";
import EditProfessionalModal from "./modals/EditProfessionalModal";
import EditEstablishmentModal from "./modals/EditEstablishmentModal";
import EditAvailabilityModal from "./modals/EditAvailabilityModal";
import ConfirmationModal from "../shared/modals/ConfirmationModal";
import SuccessModal from "../shared/modals/SuccessModal";
import type {
  Service,
  Professional,
  Establishment,
  CreateServiceData,
  CreateProfessionalData,
  UpdateEstablishmentData,
  AvailabilityData,
} from "../../types";

interface ModalsManagerProps {
  isServiceOpen: boolean;
  isProfessionalOpen: boolean;
  isEstablishmentOpen: boolean;
  isAvailabilityOpen: boolean;
  isDeleteConfirmOpen: boolean;
  isSuccessOpen: boolean;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  establishmentToEdit: Establishment | null;
  deleteTarget: {
    type: "service" | "professional";
    id: string;
    name: string;
  } | null;
  successMessage: string;
  allServices: Service[]; // Nova prop
  onCloseService: () => void;
  onCloseProfessional: () => void;
  onCloseEstablishment: () => void;
  onCloseAvailability: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseSuccess: () => void;
  onConfirmDelete: () => Promise<void>;
  onSaveService: (data: CreateServiceData) => Promise<void>;
  onSaveProfessional: (data: CreateProfessionalData) => Promise<void>;
  onSaveEstablishment: (data: UpdateEstablishmentData) => Promise<void>;
  onSaveAvailability: (data: AvailabilityData) => Promise<void>;
}

export default function ModalsManager({
  isServiceOpen,
  isProfessionalOpen,
  isEstablishmentOpen,
  isAvailabilityOpen,
  isDeleteConfirmOpen,
  isSuccessOpen,
  selectedService,
  selectedProfessional,
  establishmentToEdit,
  deleteTarget,
  successMessage,
  allServices,
  onCloseService,
  onCloseProfessional,
  onCloseEstablishment,
  onCloseAvailability,
  onCloseDeleteConfirm,
  onCloseSuccess,
  onConfirmDelete,
  onSaveService,
  onSaveProfessional,
  onSaveEstablishment,
  onSaveAvailability,
}: ModalsManagerProps) {
  return (
    <>
      <EditServiceModal
        isOpen={isServiceOpen}
        onClose={onCloseService}
        onSave={onSaveService}
        service={selectedService}
      />
      <EditProfessionalModal
        isOpen={isProfessionalOpen}
        onClose={onCloseProfessional}
        onSave={onSaveProfessional}
        professional={selectedProfessional}
        allServices={allServices}
      />
      <EditEstablishmentModal
        isOpen={isEstablishmentOpen}
        onClose={onCloseEstablishment}
        onSave={onSaveEstablishment}
        establishment={establishmentToEdit}
      />
      <EditAvailabilityModal
        isOpen={isAvailabilityOpen}
        onClose={onCloseAvailability}
        onSave={onSaveAvailability}
        professional={selectedProfessional}
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
