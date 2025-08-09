"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

// Tipos que o modal precisa conhecer
interface Availability {
  [key: string]: { start: string; end: string } | null;
}
interface Professional {
  id: string;
  name: string;
  availability?: Availability;
}

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availability: Availability) => void;
  professional: Professional | null;
}

const daysOfWeek = [
  { key: "segunda", label: "Segunda-feira" },
  { key: "terca", label: "Terça-feira" },
  { key: "quarta", label: "Quarta-feira" },
  { key: "quinta", label: "Quinta-feira" },
  { key: "sexta", label: "Sexta-feira" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export default function EditAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  professional,
}: EditAvailabilityModalProps) {
  const [availability, setAvailability] = useState<Availability>({});

  useEffect(() => {
    // Preenche o estado com a disponibilidade existente do profissional
    if (professional?.availability) {
      setAvailability(professional.availability);
    } else {
      // Se não houver, inicia um objeto vazio
      setAvailability({});
    }
  }, [professional]);

  const handleTimeChange = (
    day: string,
    type: "start" | "end",
    value: string
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        start: type === "start" ? value : prev[day]?.start || "",
        end: type === "end" ? value : prev[day]?.end || "",
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    setAvailability((prev) => {
      const newAvailability = { ...prev };
      if (newAvailability[day]) {
        // Se já existe, remove (o profissional não trabalha nesse dia)
        newAvailability[day] = null;
      } else {
        // Se não existe, adiciona com horários padrão
        newAvailability[day] = { start: "09:00", end: "18:00" };
      }
      return newAvailability;
    });
  };

  const handleSave = () => {
    onSave(availability);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                  className="text-lg font-bold leading-6 text-gray-900"
                >
                  Horário de Trabalho de {professional?.name}
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  {daysOfWeek.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!availability[key]}
                          onChange={() => handleDayToggle(key)}
                          className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="ml-3 font-medium text-gray-800">
                          {label}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={availability[key]?.start || ""}
                          onChange={(e) =>
                            handleTimeChange(key, "start", e.target.value)
                          }
                          disabled={!availability[key]}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-200"
                        />
                        <span>às</span>
                        <input
                          type="time"
                          value={availability[key]?.end || ""}
                          onChange={(e) =>
                            handleTimeChange(key, "end", e.target.value)
                          }
                          disabled={!availability[key]}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
                    onClick={handleSave}
                  >
                    Salvar Horários
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
