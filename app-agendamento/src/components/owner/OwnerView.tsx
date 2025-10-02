"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // 1. Importar o 'dynamic'
import { useAuth } from "@/contexts/AuthContext";
import OwnerHeader from "./OwnerHeader";
import LoadingSpinner from "./common/LoadingSpinner";
import OwnerCancelModal from "../shared/modals/OwnerCancelModal";
import TermsAndConditionsModal from "../shared/modals/TermsAndConditionsModal";
import {
  useEstablishment,
  useServices,
  useProfessionals,
} from "../../hooks/useEstablishment";
import {
  useAppointmentsForDate,
  useAppointmentsForRange,
} from "../../hooks/useAppointments";
import { getApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import {
  Share2,
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  LayoutGrid,
  CalendarDays,
  BriefcaseBusiness,
  BarChart3,
} from "lucide-react";
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
import { startOfMonth, endOfMonth } from "date-fns";

// 2. Substituir as importações estáticas por dinâmicas
//    Isso garante que o código de cada aba só seja descarregado quando o usuário clicar nela.
const DashboardTab = dynamic(() => import("./DashboardTab"), {
  loading: () => <LoadingSpinner />,
});
const ServicesTab = dynamic(() => import("./ServicesTab"), {
  loading: () => <LoadingSpinner />,
});
const ProfessionalsTab = dynamic(() => import("./ProfessionalsTab"), {
  loading: () => <LoadingSpinner />,
});
const SettingsTab = dynamic(() => import("./SettingsTab"), {
  loading: () => <LoadingSpinner />,
});
const ReportsTab = dynamic(() => import("./ReportsTab"), {
  loading: () => <LoadingSpinner />,
});
const ModalsManager = dynamic(() => import("./ModalsManager"));

type UnifiedProfessionalData = CreateProfessionalData & {
  availability?: Availability;
};

interface OnboardingLinkData {
  url: string;
}

export default function OwnerView() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "services" | "professionals" | "settings" | "reports"
  >("dashboard");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportDateRange, setReportDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [modals, setModals] = useState({
    editService: false,
    editProfessionalUnified: false,
    editEstablishment: false,
    editOperatingHours: false,
    deleteConfirm: false,
    success: false,
    ownerCancel: false,
  });

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  const [modalInitialView, setModalInitialView] = useState<
    "details" | "availability"
  >("details");
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

  const { userData, acceptTerms, refreshUserData } = useAuth();
  const {
    establishment,
    loading: estLoading,
    updateEstablishment,
  } = useEstablishment();
  const servicesData = useServices();
  const professionalsData = useProfessionals();
  const appointmentsData = useAppointmentsForDate(selectedDate);
  const reportAppointmentsData = useAppointmentsForRange(
    reportDateRange.from,
    reportDateRange.to
  );

  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  useEffect(() => {
    if (userData && !userData.termsAccepted) {
      setIsTermsModalOpen(true);
    }
  }, [userData]);

  const handleAcceptTerms = async () => {
    if (!userData) return;
    setIsAcceptingTerms(true);
    try {
      await acceptTerms(userData.uid);
      await refreshUserData();
      setIsTermsModalOpen(false);
    } catch (error) {
      console.error("Erro ao aceitar os termos:", error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  const handleConnectMercadoPago = async () => {
    setMpLoading(true);
    setMpError(null);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const generateLink = httpsCallable(
        functions,
        "generateMercadoPagoOnboardingLink"
      );
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
    setModalInitialView("details");
    openModal("editProfessionalUnified");
  };
  const handleUpdateProfessional = (id: string) => {
    const professional = professionalsData.professionals.find(
      (p) => p.id === id
    );
    if (professional) {
      setSelectedProfessional(professional);
      setModalInitialView("details");
      openModal("editProfessionalUnified");
    }
  };
  const handleManageAvailability = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalInitialView("availability");
    openModal("editProfessionalUnified");
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
    data.name = data.firstName;
    if (selectedProfessional) {
      await professionalsData.updateProfessional(selectedProfessional.id, data);
      showSuccess("Profissional atualizado!");
    } else {
      await professionalsData.createProfessional(data);
      showSuccess("Profissional criado!");
    }
    await professionalsData.refresh();
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
    }
  };
  const handleShareLink = () => {
    if (!establishment?.slug) {
      alert(
        "Não foi possível gerar o link, dados do estabelecimento incompletos ou incorretos. Tente editar e salvar o nome novamente na aba de configurações. Não é permitido caracteres especiais no nome. Ex: @, #, $, %, ã, ç, etc. Certifique-se de que você salvou o nome do estabelecimento na aba de configurações antes de compartilhar o link, pois o link é gerado a partir do nome."
      );
      return;
    }
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
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "services", label: "Serviços", icon: ClipboardList },
    { key: "professionals", label: "Profissionais", icon: Users },
    { key: "reports", label: "Relatórios", icon: BarChart3 },
    { key: "settings", label: "Configurações", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onConfirm={handleAcceptTerms}
        isLoading={isAcceptingTerms}
      />
      <OwnerHeader
        establishment={establishment}
        onPhotoUpdated={(url) => updateEstablishment({ imageURL: url })}
      />
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <ul className="flex justify-around sm:justify-start sm:space-x-6 py-4 overflow-x-auto">
            {navItems.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <li key={tab.key}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-2 text-sm font-medium transition whitespace-nowrap ${
                      activeTab === tab.key
                        ? "text-white bg-gradient-to-r from-teal-400 to-indigo-500 px-4 py-2 rounded-lg shadow"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-4 space-y-8">
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
            <br />
            <strong>Importante!</strong>: Atualize a página para que seja gerado
            o novo link após a modificação do nome.
          </InfoTooltip>
        </div>

        {activeTab === "dashboard" && establishment && (
          <DashboardTab
            stats={{
              services: servicesData.services.length,
              professionals: professionalsData.professionals.length,
              today: appointmentsData.appointmentsForDate.length,
            }}
            icons={{
              services: LayoutGrid,
              professionals: BriefcaseBusiness,
              today: CalendarDays,
            }}
            appointmentsForDate={appointmentsData.appointmentsForDate}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            loading={appointmentsData.loading}
            onOwnerCancelAppointment={handleOpenOwnerCancelModal}
            establishmentStatus={establishment.accountStatus}
            pendingFines={[]}
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
            establishmentId={establishment?.id || ""}
            createProfessional={handleCreateProfessional}
            updateProfessional={handleUpdateProfessional}
            onManageAvailability={handleManageAvailability}
            onInviteProfessional={handleInviteProfessional}
            onResendInvite={handleResendInvite}
            refreshProfessionals={professionalsData.refresh}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            mpData={mpData}
            onEditEstablishment={() => openModal("editEstablishment")}
            onManageOperatingHours={() => openModal("editOperatingHours")}
          />
        )}
        {activeTab === "reports" && (
          <ReportsTab
            data={reportAppointmentsData.appointments}
            loading={reportAppointmentsData.loading}
            dateRange={reportDateRange}
            onDateRangeChange={setReportDateRange}
            professionals={professionalsData.professionals}
            services={servicesData.services}
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
        initialView={modalInitialView}
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
