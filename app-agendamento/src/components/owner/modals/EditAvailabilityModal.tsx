"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { AvailabilityData, WeeklyDay, TimeSlot } from "../../../types";

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvailabilityData) => Promise<void>;
  availability?: AvailabilityData | null;
  establishmentId: string;
}

const defaultTimeSlots: TimeSlot[] = [
  { start: "08:00", end: "12:00" },
  { start: "13:00", end: "18:00" },
];

const daysOfWeek = [
  { dayOfWeek: 1, dayName: "Segunda-feira" },
  { dayOfWeek: 2, dayName: "Terça-feira" },
  { dayOfWeek: 3, dayName: "Quarta-feira" },
  { dayOfWeek: 4, dayName: "Quinta-feira" },
  { dayOfWeek: 5, dayName: "Sexta-feira" },
  { dayOfWeek: 6, dayName: "Sábado" },
  { dayOfWeek: 0, dayName: "Domingo" },
];

export default function EditAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  availability,
  establishmentId,
}: EditAvailabilityModalProps) {
  const [formData, setFormData] = useState<AvailabilityData>({
    establishmentId,
    weeklySchedule: daysOfWeek.map((day) => ({
      ...day,
      isOpen: day.dayOfWeek !== 0,
      timeSlots: day.dayOfWeek !== 0 ? [...defaultTimeSlots] : [],
    })),
    autoAcceptBookings: true,
    advanceBookingDays: 30,
    minimumNoticeHours: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly" | "settings">("weekly");

  useEffect(() => {
    if (isOpen) {
      if (availability) {
        setFormData(availability);
      } else {
        setFormData({
          establishmentId,
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
      setErrors({});
    }
  }, [isOpen, availability, establishmentId]);

  const updateDayAvailability = (
    dayOfWeek: number,
    updates: Partial<WeeklyDay>
  ) => {
    setFormData((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      ),
    }));
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const day = formData.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const newSlot: TimeSlot = { start: "09:00", end: "17:00" };
    updateDayAvailability(dayOfWeek, {
      timeSlots: [...day.timeSlots, newSlot],
    });
  };

  const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    const day = formData.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDayAvailability(dayOfWeek, {
      timeSlots: day.timeSlots.filter((_, index) => index !== slotIndex),
    });
  };

  const updateTimeSlot = (
    dayOfWeek: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    const day = formData.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const updatedSlots = day.timeSlots.map((slot, index) =>
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateDayAvailability(dayOfWeek, { timeSlots: updatedSlots });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
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
              <Dialog.Panel className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gerenciar Horários de Funcionamento
                  </h3>
                  <button onClick={onClose} disabled={loading}>
                    <svg />
                  </button>
                </div>
                <div className="border-b">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab("weekly")}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "weekly"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500"
                      }`}
                    >
                      <span>📅</span>
                      <span>Horários Semanais</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "settings"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500"
                      }`}
                    >
                      <span>⚙️</span>
                      <span>Configurações</span>
                    </button>
                  </nav>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "weekly" && (
                      <div className="space-y-6">
                        {formData.weeklySchedule.map((day) => (
                          <div
                            key={day.dayOfWeek}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={day.isOpen}
                                  onChange={(e) =>
                                    updateDayAvailability(day.dayOfWeek, {
                                      isOpen: e.target.checked,
                                      timeSlots:
                                        e.target.checked &&
                                        day.timeSlots.length === 0
                                          ? [...defaultTimeSlots]
                                          : day.timeSlots,
                                    })
                                  }
                                  className="h-4 w-4 rounded"
                                />
                                <span className="font-medium text-gray-900">
                                  {day.dayName}
                                </span>
                              </div>
                              {day.isOpen && (
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => addTimeSlot(day.dayOfWeek)}
                                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                                  >
                                    + Horário
                                  </button>
                                </div>
                              )}
                            </div>
                            {day.isOpen ? (
                              <div className="space-y-2 pl-7">
                                {day.timeSlots.map((slot, slotIndex) => (
                                  <div
                                    key={slotIndex}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day.dayOfWeek,
                                          slotIndex,
                                          "start",
                                          e.target.value
                                        )
                                      }
                                      className="px-2 py-1 border rounded text-sm"
                                    />
                                    <span className="text-gray-500">às</span>
                                    <input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day.dayOfWeek,
                                          slotIndex,
                                          "end",
                                          e.target.value
                                        )
                                      }
                                      className="px-2 py-1 border rounded text-sm"
                                    />
                                    {day.timeSlots.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeTimeSlot(
                                            day.dayOfWeek,
                                            slotIndex
                                          )
                                        }
                                        className="text-red-500"
                                      >
                                        <svg />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic pl-7">
                                Fechado
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "settings" && (
                      <div className="space-y-6">
                        {/* ... Conteúdo das configurações de agendamento ... */}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                      {loading ? "Salvando..." : "Salvar Horários"}
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
