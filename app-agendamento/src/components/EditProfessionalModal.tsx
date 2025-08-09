"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

// Tipos que o modal precisa conhecer
interface Service {
  id: string;
  name: string;
}
interface Professional {
  id: string;
  name: string;
  serviceIds: string[];
}

interface EditProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfessional: Professional) => void;
  professional: Professional | null;
  allServices: Service[]; // Lista de todos os serviços para gerar os checkboxes
}

export default function EditProfessionalModal({
  isOpen,
  onClose,
  onSave,
  professional,
  allServices,
}: EditProfessionalModalProps) {
  const [name, setName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setSelectedServices(professional.serviceIds);
    }
  }, [professional]);

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    if (!professional) return;

    onSave({
      ...professional,
      name,
      serviceIds: selectedServices,
    });
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900"
                >
                  Editar Profissional
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="edit-profName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome do Profissional
                    </label>
                    <input
                      type="text"
                      id="edit-profName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Serviços que realiza
                    </label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                      {allServices.map((service) => (
                        <div key={service.id} className="flex items-center">
                          <input
                            id={`edit-service-${service.id}`}
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleServiceSelection(service.id)}
                            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`edit-service-${service.id}`}
                            className="ml-3 block text-sm"
                          >
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                    onClick={handleSave}
                  >
                    Salvar Alterações
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
