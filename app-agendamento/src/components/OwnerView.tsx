"use client";

import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { db, storage } from "@/lib/firebaseConfig";
import { app } from "@/lib/firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, startOfDay, endOfDay } from "date-fns";
import ConfirmationModal from "./ConfirmationModal";
import EditServiceModal from "./EditServiceModal";
import EditProfessionalModal from "./EditProfessionalModal";
import EditAvailabilityModal from "./EditAvailabilityModal";

// Interfaces
interface Establishment {
  businessName: string;
  phone: string;
  address: string;
  stripeAccountId?: string;
}
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}
interface Availability {
  [key: string]: { start: string; end: string } | null;
}
interface Professional {
  id: string;
  name: string;
  serviceIds: string[];
  photoURL?: string;
  availability?: Availability;
}
interface Appointment {
  id: string;
  dateTime: Timestamp;
  serviceId: string;
  professionalId: string;
  clientName: string;
}
interface AppointmentWithDetails extends Appointment {
  serviceName: string;
  professionalName: string;
}
interface OwnerViewProps {
  user: User;
}

export default function OwnerView({ user }: OwnerViewProps) {
  const { uid } = user;

  // Estados
  const [establishment, setEstablishment] = useState<Establishment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("agenda");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<
    Date | undefined
  >(new Date());
  const [agendaAppointments, setAgendaAppointments] = useState<
    AppointmentWithDetails[]
  >([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDeleteServiceModalOpen, setIsDeleteServiceModalOpen] =
    useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isDeleteProfModalOpen, setIsDeleteProfModalOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<string | null>(null);
  const [isEditProfModalOpen, setIsEditProfModalOpen] = useState(false);
  const [profToEdit, setProfToEdit] = useState<Professional | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [profToEditAvailability, setProfToEditAvailability] =
    useState<Professional | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const establishmentRef = doc(db, "establishments", uid);
    const unsubscribeEstablishment = onSnapshot(establishmentRef, (docSnap) => {
      if (docSnap.exists()) {
        setEstablishment(docSnap.data() as Establishment);
        const servicesRef = collection(db, "establishments", uid, "services");
        const unsubscribeServices = onSnapshot(query(servicesRef), (snapshot) =>
          setServices(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Service)
            )
          )
        );
        const professionalsRef = collection(
          db,
          "establishments",
          uid,
          "professionals"
        );
        const unsubscribeProfessionals = onSnapshot(
          query(professionalsRef),
          (snapshot) =>
            setProfessionals(
              snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Professional)
              )
            )
        );
        setIsLoading(false);
        return () => {
          unsubscribeServices();
          unsubscribeProfessionals();
        };
      } else {
        setEstablishment(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribeEstablishment();
  }, [uid]);

  useEffect(() => {
    if (
      !selectedAgendaDate ||
      !uid ||
      services.length === 0 ||
      professionals.length === 0
    )
      return;
    const start = startOfDay(selectedAgendaDate);
    const end = endOfDay(selectedAgendaDate);
    const q = query(
      collection(db, "appointments"),
      where("establishmentId", "==", uid),
      where("status", "==", "confirmado"),
      where("dateTime", ">=", start),
      where("dateTime", "<=", end)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsFromDb = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
      );
      const appointmentsWithDetails = appointmentsFromDb.map((app) => {
        const service = services.find((s) => s.id === app.serviceId);
        const professional = professionals.find(
          (p) => p.id === app.professionalId
        );
        return {
          ...app,
          serviceName: service?.name || "Serviço Removido",
          professionalName: professional?.name || "Profissional Removido",
        };
      });
      appointmentsWithDetails.sort(
        (a, b) => a.dateTime.toMillis() - b.dateTime.toMillis()
      );
      setAgendaAppointments(appointmentsWithDetails);
    });
    return () => unsubscribe();
  }, [selectedAgendaDate, uid, services, professionals]);

  // Handlers
  const handleSaveEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    const establishmentRef = doc(db, "establishments", uid);
    await setDoc(establishmentRef, {
      ownerId: uid,
      businessName,
      phone,
      address,
      createdAt: serverTimestamp(),
    });
  };
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !servicePrice || !serviceDuration) return;
    await addDoc(collection(db, "establishments", uid, "services"), {
      name: serviceName,
      price: Number(servicePrice),
      duration: Number(serviceDuration),
    });
    setServiceName("");
    setServicePrice("");
    setServiceDuration("");
  };
  const openDeleteServiceModal = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteServiceModalOpen(true);
  };
  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      await deleteDoc(
        doc(db, "establishments", uid, "services", serviceToDelete)
      );
      setIsDeleteServiceModalOpen(false);
      setServiceToDelete(null);
    }
  };
  const openEditServiceModal = (service: Service) => {
    setServiceToEdit(service);
    setIsEditServiceModalOpen(true);
  };
  const handleSaveService = async (updatedService: Service) => {
    if (updatedService) {
      const serviceRef = doc(
        db,
        "establishments",
        uid,
        "services",
        updatedService.id
      );
      await updateDoc(serviceRef, {
        name: updatedService.name,
        price: updatedService.price,
        duration: updatedService.duration,
      });
    }
  };
  const handleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };
  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalName || selectedServices.length === 0) {
      alert("Preencha o nome e selecione um serviço.");
      return;
    }
    let photoURL = "";
    if (photoFile) {
      const photoRef = ref(
        storage,
        `professionals/${uid}/${Date.now()}_${photoFile.name}`
      );
      await uploadBytes(photoRef, photoFile);
      photoURL = await getDownloadURL(photoRef);
    }
    await addDoc(collection(db, "establishments", uid, "professionals"), {
      name: professionalName,
      serviceIds: selectedServices,
      photoURL: photoURL,
    });
    setProfessionalName("");
    setSelectedServices([]);
    setPhotoFile(null);
    const fileInput = document.getElementById("profPhoto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  const openDeleteProfModal = (profId: string) => {
    setProfToDelete(profId);
    setIsDeleteProfModalOpen(true);
  };
  const confirmDeleteProf = async () => {
    if (profToDelete) {
      await deleteDoc(
        doc(db, "establishments", uid, "professionals", profToDelete)
      );
      setIsDeleteProfModalOpen(false);
      setProfToDelete(null);
    }
  };
  const openEditProfModal = (prof: Professional) => {
    setProfToEdit(prof);
    setIsEditProfModalOpen(true);
  };
  const handleSaveProf = async (updatedProf: Professional) => {
    if (updatedProf) {
      const profRef = doc(
        db,
        "establishments",
        uid,
        "professionals",
        updatedProf.id
      );
      await updateDoc(profRef, {
        name: updatedProf.name,
        serviceIds: updatedProf.serviceIds,
      });
    }
  };
  const openAvailabilityModal = (prof: Professional) => {
    setProfToEditAvailability(prof);
    setIsAvailabilityModalOpen(true);
  };
  const handleSaveAvailability = async (availability: Availability) => {
    if (!profToEditAvailability) return;
    const profRef = doc(
      db,
      "establishments",
      uid,
      "professionals",
      profToEditAvailability.id
    );
    await updateDoc(profRef, { availability });
  };
  const openCancelModal = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setIsCancelModalOpen(true);
  };
  const confirmCancelAppointment = async () => {
    if (appointmentToCancel) {
      const appointmentRef = doc(db, "appointments", appointmentToCancel);
      try {
        await updateDoc(appointmentRef, { status: "cancelado" });
      } catch (error) {
        console.error("Erro ao cancelar agendamento: ", error);
      } finally {
        setIsCancelModalOpen(false);
        setAppointmentToCancel(null);
      }
    }
  };
  const handleCreateConnectedAccount = async () => {
    setIsConnectingStripe(true);
    try {
      const functions = getFunctions(app, "southamerica-east1");
      const createConnectedAccount = httpsCallable(
        functions,
        "createconnectedaccount"
      );
      const result = await createConnectedAccount();
      console.log("Conta conectada criada:", result.data);
    } catch (error) {
      console.error("Erro ao criar conta conectada:", error);
      alert("Ocorreu um erro ao conectar com o Stripe. Tente novamente.");
    } finally {
      setIsConnectingStripe(false);
    }
  };
  const handleOnboarding = async () => {
    setIsOnboarding(true);
    try {
      const functions = getFunctions(app, "southamerica-east1");
      const createAccountLink = httpsCallable(functions, "createaccountlink");
      const result = await createAccountLink();
      const { url } = result.data as { url: string };
      window.location.href = url;
    } catch (error) {
      console.error("Erro ao gerar link de onboarding:", error);
      alert("Não foi possível iniciar o processo. Tente novamente.");
    } finally {
      setIsOnboarding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-600">
        Carregando dados do seu negócio...
      </div>
    );
  }
  if (!establishment) {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          Complete o cadastro do seu negócio
        </h1>
        <form onSubmit={handleSaveEstablishment} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-gray-700"
            >
              Nome do Estabelecimento
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Endereço Completo
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    );
  }

  const renderServicesView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Adicionar Novo Serviço
          </h2>
          <form onSubmit={handleAddService} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="serviceName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome do Serviço
              </label>
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label
                htmlFor="servicePrice"
                className="block text-sm font-medium text-gray-700"
              >
                Preço (R$)
              </label>
              <input
                type="number"
                id="servicePrice"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label
                htmlFor="serviceDuration"
                className="block text-sm font-medium text-gray-700"
              >
                Duração (minutos)
              </label>
              <input
                type="number"
                id="serviceDuration"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all"
            >
              Adicionar Serviço
            </button>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">Meus Serviços</h2>
          <div className="mt-4 space-y-3">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-md group"
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {service.duration} min
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-lg text-gray-900">
                      R$ {service.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => openEditServiceModal(service)}
                      className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Editar serviço"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path
                          fillRule="evenodd"
                          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteServiceModal(service.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir serviço"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum serviço cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  const renderProfessionalsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Adicionar Profissional
          </h2>
          <form onSubmit={handleAddProfessional} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="profName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                type="text"
                id="profName"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label
                htmlFor="profPhoto"
                className="block text-sm font-medium text-gray-700"
              >
                Foto
              </label>
              <input
                type="file"
                id="profPhoto"
                onChange={handlePhotoChange}
                accept="image/png, image/jpeg"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Serviços
              </label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      id={`s-${service.id}`}
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceSelection(service.id)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label
                      htmlFor={`s-${service.id}`}
                      className="ml-3 block text-sm"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700"
            >
              Adicionar
            </button>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Meus Profissionais
          </h2>
          <div className="mt-4 space-y-4">
            {professionals.length > 0 ? (
              professionals.map((p) => {
                const profServices = services.filter((s) =>
                  p.serviceIds.includes(s.id)
                );
                return (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <>
                          {p.photoURL ? (
                            <Image
                              src={p.photoURL}
                              alt={p.name}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full object-cover mr-4"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 flex items-center justify-center mr-4 shrink-0">
                              <span className="text-2xl font-bold text-white">
                                {p.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profServices.map((s) => (
                              <span
                                key={s.id}
                                className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditProfModal(p)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path
                              fillRule="evenodd"
                              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteProfModal(p.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Excluir"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => openAvailabilityModal(p)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-800"
                      >
                        Gerenciar Horários
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">Nenhum profissional cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  const renderAgendaView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4 flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedAgendaDate}
            onSelect={setSelectedAgendaDate}
            locale={ptBR}
          />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Agenda do dia:{" "}
            {selectedAgendaDate ? format(selectedAgendaDate, "dd/MM/yyyy") : ""}
          </h2>
          <div className="mt-4 space-y-4">
            {agendaAppointments.length > 0 ? (
              agendaAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <p className="text-lg font-bold text-teal-600">
                      {format(app.dateTime.toDate(), "HH:mm")}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {app.serviceName}
                    </p>
                    <div className="text-sm text-gray-600 mt-2">
                      <p>Cliente: {app.clientName}</p>
                      <p>Profissional: {app.professionalName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCancelModal(app.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Cancelar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum agendamento para este dia.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800">
        Configurações de Pagamento
      </h2>
      <div className="mt-4 pt-4 border-t">
        {establishment && establishment.stripeAccountId ? (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-800">
              ✅ Conta de Pagamento Conectada!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Complete o cadastro de informações no Stripe para poder receber
              pagamentos.
            </p>
            <button
              onClick={handleOnboarding}
              disabled={isOnboarding}
              className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {isOnboarding
                ? "Gerando link..."
                : "Completar Cadastro / Gerenciar Conta"}
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-800">
              Conecte-se ao Stripe para receber pagamentos
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Para que seus clientes possam pagar online, você precisa conectar
              uma conta do Stripe.
            </p>
            <button
              onClick={handleCreateConnectedAccount}
              disabled={isConnectingStripe}
              className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {isConnectingStripe ? "Conectando..." : "Conectar com Stripe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("agenda")}
              className={`${
                activeTab === "agenda"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Agenda
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`${
                activeTab === "services"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Serviços
            </button>
            <button
              onClick={() => setActiveTab("professionals")}
              className={`${
                activeTab === "professionals"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profissionais
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Configurações
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "agenda" && renderAgendaView()}
      {activeTab === "services" && renderServicesView()}
      {activeTab === "professionals" && renderProfessionalsView()}
      {activeTab === "settings" && renderSettingsView()}
      <ConfirmationModal
        isOpen={isDeleteServiceModalOpen}
        onClose={() => setIsDeleteServiceModalOpen(false)}
        onConfirm={confirmDeleteService}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço?"
      />
      <EditServiceModal
        isOpen={isEditServiceModalOpen}
        onClose={() => setIsEditServiceModalOpen(false)}
        onSave={handleSaveService}
        service={serviceToEdit}
      />
      <ConfirmationModal
        isOpen={isDeleteProfModalOpen}
        onClose={() => setIsDeleteProfModalOpen(false)}
        onConfirm={confirmDeleteProf}
        title="Excluir Profissional"
        message="Tem certeza que deseja excluir este profissional?"
      />
      <EditProfessionalModal
        isOpen={isEditProfModalOpen}
        onClose={() => setIsEditProfModalOpen(false)}
        onSave={handleSaveProf}
        professional={profToEdit}
        allServices={services}
      />
      <EditAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onSave={handleSaveAvailability}
        professional={profToEditAvailability}
      />
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelAppointment}
        title="Cancelar Agendamento"
        message="Tem certeza que deseja cancelar este agendamento?"
      />
    </>
  );
}
