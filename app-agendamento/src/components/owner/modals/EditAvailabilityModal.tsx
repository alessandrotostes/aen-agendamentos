"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type {
  AvailabilityData,
  WeeklyDay,
  TimeSlot,
  Professional,
} from "../../../types";

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvailabilityData) => Promise<void>;
  professional: Professional | null;
}

const daysOfWeek = [
  { dayOfWeek: 0, dayName: "Domingo" },
  { dayOfWeek: 1, dayName: "Segunda-feira" },
  { dayOfWeek: 2, dayName: "Terça-feira" },
  { dayOfWeek: 3, dayName: "Quarta-feira" },
  { dayOfWeek: 4, dayName: "Quinta-feira" },
  { dayOfWeek: 5, dayName: "Sexta-feira" },
  { dayOfWeek: 6, dayName: "Sábado" },
];

const defaultTimeSlots: TimeSlot[] = [{ start: "09:00", end: "18:00" }];

export default function EditAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  professional,
}: EditAvailabilityModalProps) {
  const [formData, setFormData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && professional) {
      if (professional.availability) {
        // CORREÇÃO: Traduz os dados salvos para o formato do formulário
        const weeklySchedule = daysOfWeek.map((day) => {
          const dayKey = day.dayName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace("-feira", "");
          const schedule = professional.availability![dayKey];
          return {
            ...day,
            isOpen: !!schedule,
            timeSlots: schedule ? [schedule] : [],
          };
        });
        setFormData({
          establishmentId: professional.establishmentId,
          weeklySchedule,
          autoAcceptBookings: true, // Futuramente, podemos salvar isso também
          advanceBookingDays: 30,
          minimumNoticeHours: 2,
        });
      } else {
        // Se não houver dados salvos, cria um horário padrão
        setFormData({
          establishmentId: professional.establishmentId,
          weeklySchedule: daysOfWeek.map((day) => ({
            ...day,
            isOpen: day.dayOfWeek !== 0,
            timeSlots: day.dayOfWeek !== 0 ? [...defaultTimeSlots] : [],
          })),
          autoAcceptBookings: true,
          advanceBookingDays: 30,
          minimumNoticeHours: 2,
        });
      }
    }
  }, [isOpen, professional]);

  const updateDayAvailability = (
    dayOfWeek: number,
    updates: Partial<WeeklyDay>
  ) => {
    if (!formData) return;
    setFormData((prev) => ({
      ...prev!,
      weeklySchedule: prev!.weeklySchedule.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      ),
    }));
  };

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    const day = formData?.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDayAvailability(dayOfWeek, {
      isOpen: checked,
      timeSlots:
        checked && day.timeSlots.length === 0
          ? [...defaultTimeSlots]
          : checked
          ? day.timeSlots
          : [],
    });
  };

  const updateTimeSlot = (
    dayOfWeek: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    const day = formData?.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const updatedSlots = day.timeSlots.map((slot, index) =>
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateDayAvailability(dayOfWeek, { timeSlots: updatedSlots });
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Erro no onSave do modal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900"
                >
                  Horário de Trabalho de {professional?.firstName}
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  {formData.weeklySchedule.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isOpen}
                          onChange={(e) =>
                            handleDayToggle(day.dayOfWeek, e.target.checked)
                          }
                          className="h-5 w-5 rounded border-gray-300 text-teal-600"
                        />
                        <label className="ml-3 font-medium text-gray-800">
                          {day.dayName}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={day.timeSlots[0]?.start || ""}
                          onChange={(e) =>
                            updateTimeSlot(
                              day.dayOfWeek,
                              0,
                              "start",
                              e.target.value
                            )
                          }
                          disabled={!day.isOpen}
                          className="w-24 rounded-md border-gray-300 shadow-sm disabled:bg-gray-200"
                        />
                        <span>às</span>
                        <input
                          type="time"
                          value={day.timeSlots[0]?.end || ""}
                          onChange={(e) =>
                            updateTimeSlot(
                              day.dayOfWeek,
                              0,
                              "end",
                              e.target.value
                            )
                          }
                          disabled={!day.isOpen}
                          className="w-24 rounded-md border-gray-300 shadow-sm disabled:bg-gray-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Horários"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
