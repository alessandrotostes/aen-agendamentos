"use client";

import React, { useState } from "react";
import OwnerHeader from "./OwnerHeader";
import DashboardTab from "./DashboardTab";
import ServicesTab from "./ServicesTab";
import ProfessionalsTab from "./ProfessionalsTab";
import SettingsTab from "./SettingsTab";
import ModalsManager from "./ModalsManager";
import LoadingSpinner from "./common/LoadingSpinner";
import {
  useEstablishment,
  useServices,
  useProfessionals,
} from "../../hooks/useEstablishment";
import { useAppointmentsForDate } from "../../hooks/useAppointments";
import { useStripeAccount } from "../../hooks/useStripe";
import type {
  Service,
  Professional,
  CreateServiceData,
  CreateProfessionalData,
  UpdateEstablishmentData,
  OperatingHours,
  Availability,
} from "../../types";

type UnifiedProfessionalData = CreateProfessionalData & {
  availability?: Availability;
};

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

  const {
    establishment,
    loading: estLoading,
    updateEstablishment,
    refreshEstablishment,
  } = useEstablishment();
  const servicesData = useServices();
  const professionalsData = useProfessionals();
  const appointmentsData = useAppointmentsForDate(selectedDate);
  const stripeHook = useStripeAccount();

  const handleCreateStripeAccount = async () => {
    try {
      const result = await stripeHook.createConnectedAccount();
      if (result?.accountId) {
        await refreshEstablishment();
      }
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Falha ao criar conta Stripe:", error);
      alert(
        "Ocorreu um erro ao conectar com o Stripe. Verifique o console para mais detalhes."
      );
    }
  };

  const handleOnboardingRedirect = async () => {
    try {
      const url = await stripeHook.createAccountLink();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Falha ao obter o link de onboarding:", error);
      alert(
        "Ocorreu um erro ao gerar o link. Verifique o console para mais detalhes."
      );
    }
  };

  const stripeData = {
    hasStripeAccount: !!establishment?.stripeAccountId,
    isStripeOnboarded: !!establishment?.stripeAccountOnboarded,
    loading: stripeHook.loading,
    error: stripeHook.error,
    createConnectedAccount: handleCreateStripeAccount,
    createAccountLink: handleOnboardingRedirect,
  };

  const isLoading =
    estLoading || servicesData.loading || professionalsData.loading;

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
      setDeleteTarget({ type: "professional", id, name: professional.name });
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
    // A tipagem 'UnifiedProfessionalData' não corresponde exatamente à 'CreateProfessionalData'
    // que a função do hook espera, então removemos 'availability' antes de passar.
    const { availability, ...professionalData } = data;
    const dataToSave = { ...professionalData, availability };

    if (selectedProfessional) {
      await professionalsData.updateProfessional(
        selectedProfessional.id,
        dataToSave
      );
      showSuccess("Profissional atualizado!");
    } else {
      // A função 'create' pode precisar ser ajustada se não aceitar 'availability'
      await professionalsData.createProfessional(dataToSave);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "services", label: "Serviços", icon: "✂️" },
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
          <ul className="flex space-x-2 sm:space-x-6 py-4 overflow-x-auto">
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
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            stripeData={stripeData}
            onEditEstablishment={() => openModal("editEstablishment")}
            onManageOperatingHours={() => openModal("editOperatingHours")}
            onRefreshStripeStatus={refreshEstablishment}
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
    </div>
  );
}
