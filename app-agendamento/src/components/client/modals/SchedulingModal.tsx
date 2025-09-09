"use client";

import React, { Fragment, useState, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, isToday } from "date-fns";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "@/contexts/AuthContext";
import { Service, Professional } from "@/types";
import SuccessModal from "../../shared/modals/SuccessModal";

interface PendingAppointment {
  establishmentId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  professionalId: string;
  professionalName: string;
  bookingTimestamp: string;
  clientFirstName: string;
  clientLastName: string;
}

interface BookedSlot {
  dateTime: string; // Vem como ISO string
  duration: number;
}

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  professionals: Professional[];
  establishmentId: string;
}

export default function SchedulingModal({
  isOpen,
  onClose,
  service,
  professionals,
  establishmentId,
}: SchedulingModalProps) {
  const router = useRouter();
  const { currentUser, userData } = useAuth();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedProfessionalId(null);
        setSelectedDate(undefined);
        setSelectedTime(null);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate || !selectedProfessionalId) {
      setBookedSlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingSlots(true);
      try {
        const functions = getFunctions(getApp(), "southamerica-east1");
        const getAvailability = httpsCallable(
          functions,
          "getProfessionalAvailability"
        );

        const result = await getAvailability({
          establishmentId: establishmentId,
          professionalId: selectedProfessionalId,
          date: selectedDate.toISOString(),
        });

        setBookedSlots(result.data as BookedSlot[]);
      } catch (error) {
        console.error(
          "Erro ao buscar disponibilidade via Cloud Function:",
          error
        );
        alert("Não foi possível carregar os horários. Tente novamente.");
        setBookedSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedProfessionalId, establishmentId]);

  const availableProfessionals = useMemo(() => {
    if (!service) return [];
    return professionals.filter((prof) => prof.serviceIds.includes(service.id));
  }, [service, professionals]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedProfessionalId || !service) return [];
    const professional = professionals.find(
      (p) => p.id === selectedProfessionalId
    );
    if (!professional?.availability) return [];

    const dayKeyMap: { [key: string]: string } = {
      domingo: "domingo",
      "segunda-feira": "segunda",
      "terça-feira": "terca",
      "quarta-feira": "quarta",
      "quinta-feira": "quinta",
      "sexta-feira": "sexta",
      sábado: "sabado",
    };
    const dayOfWeek =
      dayKeyMap[format(selectedDate, "eeee", { locale: ptBR }).toLowerCase()];
    const workingHours = professional.availability[dayOfWeek];
    if (!workingHours) return [];

    const slotsInMinutes = [];
    const startInMinutes =
      parseInt(workingHours.start.split(":")[0]) * 60 +
      parseInt(workingHours.start.split(":")[1]);
    const endInMinutes =
      parseInt(workingHours.end.split(":")[0]) * 60 +
      parseInt(workingHours.end.split(":")[1]);

    const now = new Date();
    const startOfBookingWindow = isToday(selectedDate)
      ? now.getHours() * 60 + now.getMinutes()
      : 0;

    for (let t = startInMinutes; t < endInMinutes; t += 15) {
      if (t >= startOfBookingWindow) {
        slotsInMinutes.push(t);
      }
    }

    const bookedIntervals = bookedSlots.map((slot) => {
      const bookedDate = new Date(slot.dateTime);
      const start = bookedDate.getHours() * 60 + bookedDate.getMinutes();
      const end = start + slot.duration;
      return { start, end };
    });

    const availableSlots = slotsInMinutes.filter((potentialStart) => {
      const potentialEnd = potentialStart + service.duration;
      if (potentialEnd > endInMinutes) return false;

      const hasConflict = bookedIntervals.some(
        (booked) => potentialStart < booked.end && potentialEnd > booked.start
      );

      return !hasConflict;
    });

    return availableSlots.map((minutesTotal) => {
      const hours = Math.floor(minutesTotal / 60);
      const minutes = minutesTotal % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    });
  }, [
    selectedDate,
    selectedProfessionalId,
    service,
    professionals,
    bookedSlots,
  ]);

  const handleGoToCheckout = () => {
    // A verificação agora inclui firstName e lastName para garantir que os dados do usuário carregaram
    if (!currentUser || !userData?.firstName || !userData?.lastName) {
      alert("Você precisa estar logado para agendar.");
      return;
    }
    if (!service || !selectedProfessionalId || !selectedDate || !selectedTime)
      return;

    const professional = professionals.find(
      (p) => p.id === selectedProfessionalId
    );
    const finalBookingDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    finalBookingDate.setHours(Number(hours), Number(minutes), 0, 0);

    // MUDANÇA PRINCIPAL AQUI:
    // Usamos os novos campos 'firstName' e 'lastName' do userData
    const pendingAppointment: PendingAppointment = {
      establishmentId,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      professionalId: selectedProfessionalId,
      professionalName: professional?.name || "N/A",
      bookingTimestamp: finalBookingDate.toISOString(),
      clientFirstName: userData.firstName, // <-- CORRIGIDO
      clientLastName: userData.lastName, // <-- CORRIGIDO
    };

    sessionStorage.setItem(
      "pendingAppointment",
      JSON.stringify(pendingAppointment)
    );
    router.push("/checkout");
    onClose();
  };

  const handleCloseAllModals = () => {
    setIsSuccessModalOpen(false);
    onClose();
  };

  if (!service) return null;

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 border-b pb-4"
                  >
                    Agendar:{" "}
                    <span className="text-teal-600">{service.name}</span>
                  </Dialog.Title>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          1. Escolha o profissional
                        </h4>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                          {availableProfessionals.length > 0 ? (
                            availableProfessionals.map((prof) => (
                              <button
                                key={prof.id}
                                onClick={() => {
                                  setSelectedProfessionalId(prof.id);
                                  setSelectedDate(undefined);
                                  setSelectedTime(null);
                                }}
                                className={`w-full flex items-center space-x-4 p-3 rounded-lg border-2 transition-all ${
                                  selectedProfessionalId === prof.id
                                    ? "border-teal-500 bg-teal-50"
                                    : "border-gray-200 hover:border-teal-400"
                                }`}
                              >
                                <>
                                  {prof.photoURL ? (
                                    <Image
                                      src={prof.photoURL}
                                      alt={prof.name}
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 flex items-center justify-center shrink-0">
                                      <span className="text-lg font-bold text-white">
                                        {prof.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </>
                                <p className="font-bold text-gray-800 text-md">
                                  {prof.name}
                                </p>
                              </button>
                            ))
                          ) : (
                            <p className="text-gray-500 p-2">
                              Nenhum profissional disponível para este serviço.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4
                          className={`text-lg font-semibold transition-colors ${
                            selectedProfessionalId
                              ? "text-gray-800"
                              : "text-gray-400"
                          }`}
                        >
                          2. Escolha a data
                        </h4>
                        <div className="mt-2 flex justify-center bg-gray-50 p-1 rounded-md">
                          <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={ptBR}
                            disabled={
                              !selectedProfessionalId || {
                                from: new Date(1900, 0, 1),
                                to: new Date(
                                  new Date().setDate(new Date().getDate() - 1)
                                ),
                              }
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4
                        className={`text-lg font-semibold transition-colors ${
                          selectedDate ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        3. Escolha o horário
                      </h4>
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-2">
                        {isLoadingSlots ? (
                          <p className="col-span-full text-center text-gray-500 p-4">
                            Carregando horários disponíveis...
                          </p>
                        ) : availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-2 border rounded-md text-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                                selectedTime === time
                                  ? "bg-teal-600 text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {time}
                            </button>
                          ))
                        ) : selectedDate ? (
                          <p className="col-span-full text-center text-gray-500 p-4">
                            Nenhum horário disponível para hoje.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToCheckout}
                      className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={!selectedTime}
                    >
                      Ir para Pagamento
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseAllModals}
        title="Agendamento Confirmado!"
        message={
          service
            ? `Seu horário para ${service.name} foi agendado com sucesso.`
            : "Agendamento confirmado!"
        }
      />
    </div>
  );
}
