"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Establishment, OperatingHours } from "../../../types";
import { Clock } from "lucide-react";

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hours: OperatingHours) => Promise<void>;
  establishment: Establishment | null;
}

// Renomeado para evitar conflito com outro tipo TimeSlot que você possa ter
type OperatingHoursSlot = {
  start: string;
  end: string;
};

const weekDays = [
  { key: "segunda", label: "Segunda-feira" },
  { key: "terca", label: "Terça-feira" },
  { key: "quarta", label: "Quarta-feira" },
  { key: "quinta", label: "Quinta-feira" },
  { key: "sexta", label: "Sexta-feira" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

// Gera opções de horário de 30 em 30 minutos
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export default function OperatingHoursModal({
  isOpen,
  onClose,
  onSave,
  establishment,
}: OperatingHoursModalProps) {
  const [hours, setHours] = useState<OperatingHours>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && establishment?.operatingHours) {
      setHours(establishment.operatingHours);
    } else if (isOpen) {
      const defaultHours: OperatingHours = {};
      weekDays.forEach((day) => {
        defaultHours[day.key] = { start: "09:00", end: "18:00" };
      });
      setHours(defaultHours);
    }
  }, [isOpen, establishment]);

  const handleCheckboxChange = (dayKey: string, isChecked: boolean) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: isChecked ? { start: "09:00", end: "18:00" } : null,
    }));
  };

  // --- FUNÇÃO CORRIGIDA ---
  const handleTimeChange = (
    dayKey: string,
    type: "start" | "end",
    value: string
  ) => {
    setHours((prev) => {
      // Garante que temos um objeto base para trabalhar, mesmo que seja nulo
      const existingSlot = prev[dayKey] || { start: "09:00", end: "18:00" };

      // Cria o novo horário completo
      const newSlot: OperatingHoursSlot = {
        ...existingSlot,
        [type]: value,
      };

      // Retorna o estado atualizado
      return {
        ...prev,
        [dayKey]: newSlot,
      };
    });
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(hours);
    setIsSaving(false);
    onClose();
  };

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-slate-900 flex items-center gap-2"
                >
                  <Clock className="w-6 h-6 text-teal-600" />
                  Horário de Funcionamento
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  {weekDays.map(({ key, label }) => {
                    const currentDayHours = hours[key];
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-12 items-center gap-3"
                      >
                        <div className="col-span-4 flex items-center">
                          <input
                            type="checkbox"
                            id={key}
                            checked={!!currentDayHours}
                            onChange={(e) =>
                              handleCheckboxChange(key, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={key}
                            className="ml-2 text-sm font-medium text-slate-700"
                          >
                            {label}
                          </label>
                        </div>
                        {currentDayHours ? (
                          <div className="col-span-8 grid grid-cols-2 gap-2">
                            <select
                              value={currentDayHours.start}
                              onChange={(e) =>
                                handleTimeChange(key, "start", e.target.value)
                              }
                              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-teal-500 focus:ring-teal-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={`start-${time}`} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <select
                              value={currentDayHours.end}
                              onChange={(e) =>
                                handleTimeChange(key, "end", e.target.value)
                              }
                              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-teal-500 focus:ring-teal-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={`end-${time}`} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="col-span-8 text-sm text-slate-400 font-medium bg-slate-50 rounded-md py-2 px-3">
                            Fechado
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium bg-slate-100 rounded-md hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {isSaving ? "Salvando..." : "Salvar Horários"}
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
