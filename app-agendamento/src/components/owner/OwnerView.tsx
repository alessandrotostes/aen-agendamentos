"use client";

import React, { useState, useEffect } from "react";
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
import { useTodayAppointments } from "../../hooks/useAppointments";
import { useStripeAccount } from "../../hooks/useStripe";
import type {
  Service,
  Professional,
  CreateServiceData,
  CreateProfessionalData,
  UpdateEstablishmentData,
  AvailabilityData,
} from "../../types";

export default function OwnerView() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "services" | "professionals" | "settings"
  >("dashboard");
  const [modals, setModals] = useState({
    editService: false,
    editProfessional: false,
    editEstablishment: false,
    editAvailability: false,
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
  } = useEstablishment();
  const servicesData = useServices();
  const professionalsData = useProfessionals();
  const todayAppointmentsData = useTodayAppointments();
  const stripeHook = useStripeAccount();

  const handleOnboardingRedirect = async (): Promise<string | null> => {
    try {
      const url = await stripeHook.createAccountLink();
      return url ?? null;
    } catch (error) {
      console.error("Falha ao obter o link de onboarding:", error);
      return null;
    }
  };

  const stripeData = {
    hasStripeAccount: Boolean(establishment?.stripeAccountId),
    isStripeOnboarded: Boolean(establishment?.stripeAccountOnboarded),
    loading: stripeHook.loading,
    error: stripeHook.error,
    createConnectedAccount: stripeHook.createConnectedAccount,
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
    openModal("editProfessional");
  };
  const handleUpdateProfessional = (id: string) => {
    const professional = professionalsData.professionals.find(
      (p) => p.id === id
    );
    if (professional) {
      setSelectedProfessional(professional);
      openModal("editProfessional");
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
  const handleSaveProfessional = async (data: CreateProfessionalData) => {
    if (selectedProfessional) {
      await professionalsData.updateProfessional(selectedProfessional.id, data);
      showSuccess("Profissional atualizado!");
    } else {
      await professionalsData.createProfessional(data);
      showSuccess("Profissional criado!");
    }
    closeModal("editProfessional");
  };
  const handleSaveEstablishment = async (data: UpdateEstablishmentData) => {
    await updateEstablishment(data);
    showSuccess("Estabelecimento atualizado!");
    closeModal("editEstablishment");
  };
  const handleSaveAvailability = async (data: AvailabilityData) => {
    console.log("Salvando:", data);
    showSuccess("Horários atualizados!");
    closeModal("editAvailability");
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
              today: todayAppointmentsData.todayAppointments.length,
            }}
            todayAppointments={todayAppointmentsData.todayAppointments}
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
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            establishment={establishment}
            stripeData={stripeData}
            onEditEstablishment={() => openModal("editEstablishment")}
          />
        )}
      </main>
      <ModalsManager
        isServiceOpen={modals.editService}
        isProfessionalOpen={modals.editProfessional}
        isEstablishmentOpen={modals.editEstablishment}
        isAvailabilityOpen={modals.editAvailability}
        isDeleteConfirmOpen={modals.deleteConfirm}
        isSuccessOpen={modals.success}
        selectedService={selectedService}
        selectedProfessional={selectedProfessional}
        establishmentToEdit={establishment}
        deleteTarget={deleteTarget}
        successMessage={successMessage}
        onCloseService={() => closeModal("editService")}
        onCloseProfessional={() => closeModal("editProfessional")}
        onCloseEstablishment={() => closeModal("editEstablishment")}
        onCloseAvailability={() => closeModal("editAvailability")}
        onCloseDeleteConfirm={() => closeModal("deleteConfirm")}
        onCloseSuccess={() => closeModal("success")}
        onConfirmDelete={handleConfirmDelete}
        onSaveService={handleSaveService}
        onSaveProfessional={handleSaveProfessional}
        onSaveEstablishment={handleSaveEstablishment}
        onSaveAvailability={handleSaveAvailability}
      />
    </div>
  );
}
