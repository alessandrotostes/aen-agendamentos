"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

// Definindo os tipos que vamos usar
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedService: Service) => void;
  service: Service | null; // O serviço a ser editado
}

export default function EditServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
}: EditServiceModalProps) {
  // Estados internos para controlar os campos do formulário
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  // Este useEffect atualiza os campos do formulário sempre que o serviço a ser editado muda
  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(String(service.price));
      setDuration(String(service.duration));
    }
  }, [service]);

  const handleSave = () => {
    if (!service) return;

    onSave({
      ...service,
      name,
      price: Number(price),
      duration: Number(duration),
    });
    onClose(); // Fecha o modal após salvar
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
                  Editar Serviço
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="edit-serviceName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome do Serviço
                    </label>
                    <input
                      type="text"
                      id="edit-serviceName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-servicePrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      id="edit-servicePrice"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-serviceDuration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Duração (minutos)
                    </label>
                    <input
                      type="number"
                      id="edit-serviceDuration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                      className="w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
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
