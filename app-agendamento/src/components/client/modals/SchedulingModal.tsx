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
import { Service, Professional, PendingAppointment } from "@/types";
import { motion, AnimatePresence } from "framer-motion"; // Importações para animação
import { Check } from "lucide-react"; // Ícones adicionais


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

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = ["Profissional", "Data", "Horário"];
  return (
    <nav aria-label="Progress">
      <ol role="list" className="grid grid-cols-3 gap-4">
        {steps.map((step, stepIdx) => (
          <li key={step} className="flex flex-col items-center space-y-2">
            {currentStep > stepIdx + 1 ? (
              // Passos Concluídos
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {step}
                </span>
              </>
            ) : currentStep === stepIdx + 1 ? (
              // Passo Atual
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-600 bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                </div>
                <span className="text-xs font-semibold text-teal-600">
                  {step}
                </span>
              </>
            ) : (
              // Passos Futuros
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white" />
                <span className="text-xs text-gray-500">{step}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default function SchedulingModal({
  isOpen,
  onClose,
  service,
  professionals,
  establishmentId,
}: SchedulingModalProps) {
  const router = useRouter();
  const { currentUser, userData } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Resetar o estado quando o modal é fechado/aberto
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedProfessionalId(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
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

      const hasConflict = bookedIntervals.some((booked) => {
        const isOverlapping =
          potentialStart < booked.end && potentialEnd > booked.start;
        // Log para cada horário potencial
        if (isOverlapping) {
          console.log({
            potentialSlot: `${potentialStart} - ${potentialEnd}`,
            bookedSlot: `${booked.start} - ${booked.end}`,
            overlaps: isOverlapping,
          });
        }
        return isOverlapping;
      });

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

    // =================================================================
    // ===== CORREÇÃO APLICADA AQUI ==================================
    // =================================================================
    const pendingAppointment: PendingAppointment = {
      establishmentId,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      professionalId: selectedProfessionalId,
      professionalfirstName: professional?.firstName || "N/A", // <-- CORRIGIDO para 'professionalFirstName'
      bookingTimestamp: finalBookingDate.toISOString(),
      clientFirstName: userData.firstName,
      clientLastName: userData.lastName,
    };
    // =================================================================

    sessionStorage.setItem(
      "pendingAppointment",
      JSON.stringify(pendingAppointment)
    );
    router.push("/checkout");
    onClose();
  };

  const selectedProfessional = professionals.find(
    (p) => p.id === selectedProfessionalId
  );

  const motionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (!service) return null;

  return (
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900 border-b pb-4"
                >
                  Agendar: <span className="text-teal-600">{service.name}</span>
                </Dialog.Title>

                <div className="mt-8 mb-10">
                  <Stepper currentStep={currentStep} />
                </div>

                <div className="min-h-[250px]">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        variants={motionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h4 className="font-semibold text-gray-800">
                          1. Escolha o profissional
                        </h4>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-2">
                          {availableProfessionals.map((prof) => (
                            <button
                              key={prof.id}
                              onClick={() => {
                                setSelectedProfessionalId(prof.id);
                                setCurrentStep(2);
                              }}
                              className={`w-full flex items-center space-x-4 p-3 rounded-lg border-2 transition-all ${
                                selectedProfessionalId === prof.id
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-gray-200 hover:border-teal-400"
                              }`}
                            >
                              {prof.photoURL ? (
                                <Image
                                  src={prof.photoURL}
                                  alt={prof.firstName}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 flex items-center justify-center shrink-0">
                                  <span className="text-lg font-bold text-white">
                                    {prof.firstName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <p className="font-bold text-gray-800 text-md">
                                {prof.firstName}
                              </p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        variants={motionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h4 className="font-semibold text-gray-800">
                          2. Escolha a data
                        </h4>
                        <div className="mt-2 flex justify-center bg-gray-50 p-1 rounded-md">
                          <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) {
                                setSelectedDate(date);
                                setCurrentStep(3);
                              }
                            }}
                            locale={ptBR}
                            disabled={{ before: new Date() }}
                          />
                        </div>
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        variants={motionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-gray-800">
                            3. Escolha o horário
                          </h4>
                          <div className="bg-slate-100 p-2 rounded-lg text-xs">
                            <p>
                              <strong>Profissional:</strong>{" "}
                              {selectedProfessional?.firstName}
                            </p>
                            <p>
                              <strong>Data:</strong>{" "}
                              {selectedDate
                                ? format(selectedDate, "dd/MM/yyyy")
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-2">
                          {isLoadingSlots ? (
                            <p className="col-span-full text-center text-gray-500 p-4">
                              Carregando...
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
                          ) : (
                            <p className="col-span-full text-center text-gray-500 p-4">
                              Nenhum horário disponível.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between items-center border-t pt-6">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Voltar
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    {currentStep === 3 ? (
                      <button
                        type="button"
                        onClick={handleGoToCheckout}
                        className="ml-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-gray-300"
                        disabled={!selectedTime}
                      >
                        Ir para Pagamento
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-gray-300"
                        disabled={
                          (currentStep === 1 && !selectedProfessionalId) ||
                          (currentStep === 2 && !selectedDate)
                        }
                      >
                        Próximo
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
