// src/components/shared/InfoTooltip.tsx
"use client";

// MUDANÇA 1: Trocamos Popover por Dialog e adicionamos useState para controlar o estado
import { Dialog, Transition } from "@headlessui/react";
import { Info } from "lucide-react";
import { Fragment, useState } from "react";

interface InfoTooltipProps {
  children: React.ReactNode;
}

export default function InfoTooltip({ children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      {/* MUDANÇA 2: O botão agora controla o estado do modal */}
      <div className="relative inline-flex ml-2 align-middle">
        <button
          type="button"
          onClick={openModal}
          className="group inline-flex items-center rounded-full bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* MUDANÇA 3: A estrutura do Dialog (Overlay, Painel Centralizado) */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={closeModal}>
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
                {/* MUDANÇA 4: O conteúdo do modal (Título, Mensagem e botão para fechar) */}
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <Info className="h-5 w-5 text-teal-600" />
                    Informação
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{children}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Entendi
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
