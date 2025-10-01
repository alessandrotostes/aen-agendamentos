"use client";

import React, { useState, useEffect } from "react";
import type { Appointment } from "@/types";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  appointment: Appointment | null;
}

export default function OwnerCancelModal({
  isOpen,
  onConfirm,
  onClose,
  isLoading,
  appointment,
}: Props) {
  const [accepted, setAccepted] = useState(false);

  // Efeito para resetar o checkbox ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setAccepted(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-800">
          Confirmar Cancelamento
        </h3>
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p>Você irá cancelar o agendamento de:</p>
          <p className="font-semibold text-teal-700 mt-1">
            {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim() ||
              "Cliente"}
          </p>
          <p className="text-xs text-gray-500">{appointment.serviceName}</p>
        </div>

        {/* TEXTO PRINCIPAL ATUALIZADO */}
        <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-md">
          O cancelamento por parte do estabelecimento gera um{" "}
          <strong>reembolso integral (100%)</strong> para o cliente, que será
          processado automaticamente. O horário ficará novamente disponível.
          Certifique-se de que o valor recebido pelo serviço encontra-se
          disponível na sua conta do mercado pago para que o reembolso seja
          realizado com sucesso.
        </p>

        {/* TEXTO DO CHECKBOX ATUALIZADO */}
        <div className="mt-4">
          <label className="flex items-start gap-3 p-3 bg-red-50 rounded-md cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 shrink-0 mt-0.5"
            />
            <div className="text-sm font-semibold text-red-800">
              <p>
                Entendo que esta ação é irreversível e irá{" "}
                <strong>reembolsar integralmente</strong> o cliente.
              </p>
              <p className="mt-2 font-normal text-red-700">
                Comprometo-me a informar o cliente sobre este cancelamento
                conforme os termos de uso. Estou ciente que o não cumprimento
                pode resultar em penalidades à minha conta.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold"
            disabled={isLoading}
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted || isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cancelando..." : "Cancelar e Reembolsar"}
          </button>
        </div>
      </div>
    </div>
  );
}
