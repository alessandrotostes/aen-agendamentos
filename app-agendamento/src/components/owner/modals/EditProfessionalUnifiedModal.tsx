"use client";

import React, { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import {
  Professional,
  CreateProfessionalData,
  Service,
  Availability,
  WeeklyDay,
  TimeSlot,
} from "../../../types";
import InfoTooltip from "@/components/shared/InfoTooltip";
// Alteração 1: Importar ícone para CPF e as utils de validação
import { User, Clock, FileText } from "lucide-react";
import { validationUtils } from "@/lib/utils";

type UnifiedProfessionalData = CreateProfessionalData & {
  availability?: Availability;
};

interface EditProfessionalUnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UnifiedProfessionalData) => Promise<void>;
  professional?: Professional | null;
  allServices: Service[];
  initialView: "details" | "availability";
}

const daysOfWeek: Omit<WeeklyDay, "isOpen" | "timeSlots">[] = [
  { dayOfWeek: 0, dayName: "Domingo" },
  { dayOfWeek: 1, dayName: "Segunda" },
  { dayOfWeek: 2, dayName: "Terça" },
  { dayOfWeek: 3, dayName: "Quarta" },
  { dayOfWeek: 4, dayName: "Quinta" },
  { dayOfWeek: 5, dayName: "Sexta" },
  { dayOfWeek: 6, dayName: "Sábado" },
];
const defaultTimeSlots: TimeSlot[] = [{ start: "09:00", end: "18:00" }];

export default function EditProfessionalUnifiedModal({
  isOpen,
  onClose,
  onSave,
  professional,
  allServices,
  initialView = "details",
}: EditProfessionalUnifiedModalProps) {
  const isEdit = !!professional;
  // Alteração 2: Adicionar 'cpf' ao estado inicial
  const [formData, setFormData] = useState<CreateProfessionalData>({
    name: "",
    firstName: "",
    cpf: "",
    email: "",
    phone: "",
    photoURL: "",
    bio: "",
    serviceIds: [],
    imageFile: null,
  });
  const [scheduleData, setScheduleData] = useState<WeeklyDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialView);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView);

      // Alteração 3: Popular o 'cpf' a partir do profissional existente
      setFormData({
        name: professional?.firstName || "",
        firstName: professional?.firstName || "",
        cpf: professional?.cpf || "",
        email: professional?.email || "",
        phone: professional?.phone || "",
        photoURL: professional?.photoURL || "",
        bio: professional?.bio || "",
        serviceIds: professional?.serviceIds || [],
        imageFile: null,
      });

      let initialSchedule: WeeklyDay[];
      if (professional?.availability) {
        initialSchedule = daysOfWeek.map((day) => {
          const dayKey = day.dayName.toLowerCase();
          const schedule = professional.availability![dayKey];
          return {
            ...day,
            isOpen: !!schedule,
            timeSlots: schedule ? [schedule] : defaultTimeSlots,
          };
        });
      } else {
        initialSchedule = daysOfWeek.map((day) => ({
          ...day,
          isOpen: day.dayOfWeek !== 0 && day.dayOfWeek !== 6,
          timeSlots:
            day.dayOfWeek !== 0 && day.dayOfWeek !== 6
              ? [...defaultTimeSlots]
              : [],
        }));
      }
      setScheduleData(initialSchedule);
    }
  }, [isOpen, professional, initialView]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = validationUtils.formatCPF(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };
  const handleServiceSelection = (serviceId: string) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };
  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    setScheduleData((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          return {
            ...day,
            isOpen: checked,
            timeSlots: checked
              ? day.timeSlots.length > 0
                ? day.timeSlots
                : [...defaultTimeSlots]
              : [],
          };
        }
        return day;
      })
    );
  };
  const updateTimeSlot = (
    dayOfWeek: number,
    field: "start" | "end",
    value: string
  ) => {
    setScheduleData((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const updatedSlots = [{ ...day.timeSlots[0], [field]: value }];
          return { ...day, timeSlots: updatedSlots };
        }
        return day;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const scheduleToSave: Availability = {};
    scheduleData.forEach((day) => {
      const dayKey = day.dayName.toLowerCase();
      if (day.isOpen && day.timeSlots.length > 0) {
        scheduleToSave[dayKey] = {
          start: day.timeSlots[0].start,
          end: day.timeSlots[0].end,
        };
      } else {
        scheduleToSave[dayKey] = null;
      }
    });

    // O tipo 'CreateProfessionalData' agora não inclui 'name', então está correto
    const unifiedData: UnifiedProfessionalData = {
      ...formData,
      availability: scheduleToSave,
    };

    try {
      await onSave(unifiedData);
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900"
                >
                  {isEdit
                    ? `Editar ${professional?.firstName}`
                    : "Novo Profissional"}
                </Dialog.Title>

                <div className="border-b border-gray-200 mt-4">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "details"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <User className="w-4 h-4" /> Detalhes
                    </button>
                    <button
                      onClick={() => setActiveTab("availability")}
                      className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "availability"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Clock className="w-4 h-4" /> Horários
                    </button>
                  </nav>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-4"
                >
                  {activeTab === "details" && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cpf"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          CPF *
                          <InfoTooltip>
                            O CPF é fundamental para a identificação única do
                            profissional.
                          </InfoTooltip>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="cpf"
                            name="cpf"
                            value={formData.cpf || ""}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full pl-10 px-3 py-2 border rounded-lg shadow-sm border-gray-300"
                            placeholder="000.000.000-00"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email *{" "}
                          <InfoTooltip>
                            Este email será usado para o login do profissional
                            no sistema.
                          </InfoTooltip>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Telefone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border rounded-lg shadow-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="imageFile"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Foto
                        </label>
                        <input
                          type="file"
                          id="imageFile"
                          name="imageFile"
                          onChange={handleFileChange}
                          disabled={loading}
                          accept="image/png, image/jpeg"
                          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700"
                        />
                        {(formData.imageFile || formData.photoURL) && (
                          <div className="mt-2">
                            {/* Este div pai agora controla o tamanho (w-16 h-16 => 64x64 pixels) e a forma (rounded-full) */}
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                              <Image
                                src={
                                  formData.imageFile
                                    ? URL.createObjectURL(formData.imageFile)
                                    : formData.photoURL!
                                }
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Biografia
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={loading}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Serviços que realiza
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {allServices.length > 0 ? (
                            allServices.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center"
                              >
                                <input
                                  id={`service-${service.id}`}
                                  type="checkbox"
                                  checked={formData.serviceIds.includes(
                                    service.id
                                  )}
                                  onChange={() =>
                                    handleServiceSelection(service.id)
                                  }
                                  className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`service-${service.id}`}
                                  className="ml-3 block text-sm text-gray-800"
                                >
                                  {service.name}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              Nenhum serviço cadastrado.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "availability" && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Trabalho
                      </label>
                      <div className="space-y-3">
                        {scheduleData.map((day) => (
                          <div
                            key={day.dayOfWeek}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-full sm:w-1/3 flex items-center">
                              <input
                                type="checkbox"
                                checked={day.isOpen}
                                onChange={(e) =>
                                  handleDayToggle(
                                    day.dayOfWeek,
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 rounded border-gray-300 text-teal-600"
                              />
                              <label className="ml-3 font-medium text-gray-800">
                                {day.dayName}
                              </label>
                            </div>
                            <div className="w-full sm:w-2/3 flex items-center space-x-2">
                              <input
                                type="time"
                                value={day.timeSlots[0]?.start || ""}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    day.dayOfWeek,
                                    "start",
                                    e.target.value
                                  )
                                }
                                disabled={!day.isOpen}
                                className="w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-200"
                              />
                              <span className="text-gray-500">às</span>
                              <input
                                type="time"
                                value={day.timeSlots[0]?.end || ""}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    day.dayOfWeek,
                                    "end",
                                    e.target.value
                                  )
                                }
                                disabled={!day.isOpen}
                                className="w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition disabled:bg-gray-400"
                    >
                      {loading
                        ? "Salvando..."
                        : isEdit
                        ? "Salvar Alterações"
                        : "Criar Profissional"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
