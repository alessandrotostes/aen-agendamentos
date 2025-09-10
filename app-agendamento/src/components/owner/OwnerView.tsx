"use client";

import React, { useState } from "react";
import OwnerHeader from "./OwnerHeader";
import DashboardTab from "./DashboardTab";
import ServicesTab from "./ServicesTab";
import ProfessionalsTab from "./ProfessionalsTab";
import SettingsTab from "./SettingsTab";
import ModalsManager from "./ModalsManager";
import LoadingSpinner from "./common/LoadingSpinner";
import OwnerCancelModal from "../shared/modals/OwnerCancelModal";
import {
  useEstablishment,
  useServices,
  useProfessionals,
} from "../../hooks/useEstablishment";
import { useAppointmentsForDate } from "../../hooks/useAppointments";
import { getApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import { Share2 } from "lucide-react";
import type {
  Service,
  Professional,
  CreateServiceData,
  CreateProfessionalData,
  UpdateEstablishmentData,
  Availability,
  OperatingHours,
  Appointment,
} from "../../types";
import InfoTooltip from "@/components/shared/InfoTooltip";

type UnifiedProfessionalData = CreateProfessionalData & {
  availability?: Availability;
};

// Interface para a resposta da função de onboarding do MP
interface OnboardingLinkData {
  url: string;
}

export default function OwnerView() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "services" | "professionals" | "settings"
  >("dashboard");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [modals, setModals] = useState({
    editService: false,
    editProfessionalUnified: false,
    editEstablishment: false,
    editOperatingHours: false,
    deleteConfirm: false,
    success: false,
    ownerCancel: false,
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "service" | "professional";
    id: string;
    name: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  const {
    establishment,
    loading: estLoading,
    updateEstablishment,
  } = useEstablishment();
  const servicesData = useServices();
  const professionalsData = useProfessionals();
  const appointmentsData = useAppointmentsForDate(selectedDate);

  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  const handleConnectMercadoPago = async () => {
    setMpLoading(true);
    setMpError(null);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const generateLink = httpsCallable(
        functions,
        "generateMercadoPagoOnboardingLink"
      );

      // CORREÇÃO: Tipagem do resultado
      const result =
        (await generateLink()) as HttpsCallableResult<OnboardingLinkData>;

      if (result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("A URL de onboarding não foi recebida.");
      }
    } catch (error: unknown) {
      console.error("Erro ao gerar link de onboarding:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a conexão.";
      setMpError(message);
    } finally {
      setMpLoading(false);
    }
  };

  const mpData = {
    hasMpAccount: !!establishment?.mpCredentials,
    loading: mpLoading,
    connectMercadoPago: handleConnectMercadoPago,
    error: mpError,
  };

  const isLoading =
    estLoading || servicesData.loading || professionalsData.loading;

  const handleInviteProfessional = async (professionalId: string) => {
    setIsActionLoading(professionalId);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const inviteFn = httpsCallable(functions, "inviteProfessional");
      await inviteFn({ professionalId });
      showSuccess("Convite enviado com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";
      alert(`Erro ao enviar convite: ${message}`);
      console.error(error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleResendInvite = async (professionalId: string) => {
    setIsActionLoading(professionalId);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const resendFn = httpsCallable(functions, "resendInvite");
      await resendFn({ professionalId });
      showSuccess("Convite reenviado com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";
      alert(`Erro ao reenviar convite: ${message}`);
      console.error(error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleOpenOwnerCancelModal = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    openModal("ownerCancel");
  };

  const handleConfirmOwnerCancel = async () => {
    if (!appointmentToCancel || !establishment) return;
    setIsActionLoading(appointmentToCancel.id);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const cancelFn = httpsCallable(functions, "ownerCancelAppointment");
      await cancelFn({
        appointmentId: appointmentToCancel.id,
        establishmentId: establishment.id,
      });
      showSuccess("Agendamento cancelado com sucesso e horário liberado!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";
      alert(`Erro ao cancelar agendamento: ${message}`);
      console.error(error);
    } finally {
      setIsActionLoading(null);
      closeModal("ownerCancel");
      setAppointmentToCancel(null);
    }
  };

  const openModal = (name: keyof typeof modals) =>
    setModals((prev) => ({ ...prev, [name]: true }));
  const closeModal = (name: keyof typeof modals) =>
    setModals((prev) => ({ ...prev, [name]: false }));
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    openModal("success");
  };

  const handleCreateService = () => {
    setSelectedService(null);
    openModal("editService");
  };
  const handleUpdateService = (id: string) => {
    const service = servicesData.services.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      openModal("editService");
    }
  };
  const handleDeleteService = (id: string) => {
    const service = servicesData.services.find((s) => s.id === id);
    if (service) {
      setDeleteTarget({ type: "service", id, name: service.name });
      openModal("deleteConfirm");
    }
  };
  const handleCreateProfessional = () => {
    setSelectedProfessional(null);
    openModal("editProfessionalUnified");
  };
  const handleUpdateProfessional = (id: string) => {
    const professional = professionalsData.professionals.find(
      (p) => p.id === id
    );
    if (professional) {
      setSelectedProfessional(professional);
      openModal("editProfessionalUnified");
    }
  };
  const handleDeleteProfessional = (id: string) => {
    const professional = professionalsData.professionals.find(
      (p) => p.id === id
    );
    if (professional) {
      setDeleteTarget({
        type: "professional",
        id,
        name: professional.firstName,
      });
      openModal("deleteConfirm");
    }
  };
  const handleSaveService = async (data: CreateServiceData) => {
    if (selectedService) {
      await servicesData.updateService(selectedService.id, data);
      showSuccess("Serviço atualizado!");
    } else {
      await servicesData.createService(data);
      showSuccess("Serviço criado!");
    }
    closeModal("editService");
  };
  const handleSaveProfessional = async (data: UnifiedProfessionalData) => {
    if (selectedProfessional) {
      await professionalsData.updateProfessional(selectedProfessional.id, data);
      showSuccess("Profissional atualizado!");
    } else {
      await professionalsData.createProfessional(data);
      showSuccess("Profissional criado!");
    }
    closeModal("editProfessionalUnified");
  };
  const handleSaveEstablishment = async (data: UpdateEstablishmentData) => {
    await updateEstablishment(data);
    showSuccess("Estabelecimento atualizado!");
    closeModal("editEstablishment");
  };
  const handleSaveOperatingHours = async (hours: OperatingHours) => {
    await updateEstablishment({ operatingHours: hours });
    showSuccess("Horário de funcionamento atualizado!");
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "service") {
      await servicesData.deleteService(deleteTarget.id);
      showSuccess("Serviço excluído!");
    } else {
      await professionalsData.deleteProfessional(deleteTarget.id);
      showSuccess("Profissional excluído!");
    }
    closeModal("deleteConfirm");
  };

  const handleShareLink = () => {
    // Adicionamos uma verificação para garantir que o slug exista antes de copiar
    if (!establishment?.slug) {
      alert(
        "Não foi possível gerar o link, dados do estabelecimento incompletos ou incorretos. Tente editar e salvar o nome novamente na aba de configurações. Não é permitido caracteres especiais no nome. Ex: @, #, $, %, ã, ç, etc."
      );
      return;
    }

    // A MUDANÇA ESTÁ AQUI:
    const url = `${window.location.origin}/client/salon/${establishment.slug}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        showSuccess("Link do seu estabelecimento copiado!");
      })
      .catch((err) => {
        console.error("Erro ao copiar o link:", err);
        alert("Não foi possível copiar o link.");
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "services", label: "Serviços", icon: "📋" },
    { key: "professionals", label: "Profissionais", icon: "👨‍💼" },
    { key: "settings", label: "Configurações", icon: "⚙️" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerHeader
        establishment={establishment}
        onPhotoUpdated={(url) => updateEstablishment({ imageURL: url })}
      />
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <ul className="flex justify-around sm:justify-start sm:space-x-6 py-4 overflow-x-auto">
            {navItems.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-white bg-gradient-to-r from-teal-400 to-indigo-500 px-4 py-2 rounded-lg shadow"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-end">
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4 text-teal-600" />
            Compartilhar Link do Estabelecimento
          </button>
          <InfoTooltip>
            Sempre que mudar o nome do estabelecimento será necessário reenviar
            o link para seus clientes, pois o link é gerado a partir do nome,
            sendo assim, sempre que atualizado, é gerado uma nova URL. Aguarde
            alguns minutos para que o link antigo pare de funcionar e o novo
            seja propagado.
          </InfoTooltip>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab
            stats={{
              services: servicesData.services.length,
              professionals: professionalsData.professionals.length,
              today: appointmentsData.appointmentsForDate.length,
            }}
            appointmentsForDate={appointmentsData.appointmentsForDate}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            loading={appointmentsData.loading}
            onOwnerCancelAppointment={handleOpenOwnerCancelModal}
          />
        )}
        {activeTab === "services" && (
          <ServicesTab
            services={servicesData.services}
            createService={handleCreateService}
            updateService={handleUpdateService}
            deleteService={handleDeleteService}
          />
        )}
        {activeTab === "professionals" && (
          <ProfessionalsTab
            professionals={professionalsData.professionals}
            createProfessional={handleCreateProfessional}
            updateProfessional={handleUpdateProfessional}
            deleteProfessional={handleDeleteProfessional}
            onManageAvailability={(professional) => {
              setSelectedProfessional(professional);
              openModal("editProfessionalUnified");
            }}
            onInviteProfessional={handleInviteProfessional}
            onResendInvite={handleResendInvite}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            mpData={mpData}
            onEditEstablishment={() => openModal("editEstablishment")}
            onManageOperatingHours={() => openModal("editOperatingHours")}
          />
        )}
      </main>
      <ModalsManager
        isServiceOpen={modals.editService}
        isProfessionalUnifiedOpen={modals.editProfessionalUnified}
        isEstablishmentOpen={modals.editEstablishment}
        isOperatingHoursOpen={modals.editOperatingHours}
        isDeleteConfirmOpen={modals.deleteConfirm}
        isSuccessOpen={modals.success}
        selectedService={selectedService}
        selectedProfessional={selectedProfessional}
        establishmentToEdit={establishment}
        deleteTarget={deleteTarget}
        successMessage={successMessage}
        allServices={servicesData.services}
        onCloseService={() => closeModal("editService")}
        onCloseProfessionalUnified={() => closeModal("editProfessionalUnified")}
        onCloseEstablishment={() => closeModal("editEstablishment")}
        onCloseOperatingHours={() => closeModal("editOperatingHours")}
        onCloseDeleteConfirm={() => closeModal("deleteConfirm")}
        onCloseSuccess={() => closeModal("success")}
        onConfirmDelete={handleConfirmDelete}
        onSaveService={handleSaveService}
        onSaveProfessional={handleSaveProfessional}
        onSaveEstablishment={handleSaveEstablishment}
        onSaveOperatingHours={handleSaveOperatingHours}
      />
      <OwnerCancelModal
        isOpen={modals.ownerCancel}
        onClose={() => closeModal("ownerCancel")}
        onConfirm={handleConfirmOwnerCancel}
        isLoading={!!isActionLoading}
        appointment={appointmentToCancel}
      />
    </div>
  );
}
