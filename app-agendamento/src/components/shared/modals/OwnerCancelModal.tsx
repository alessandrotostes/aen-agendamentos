"use client";

import React, { useState } from "react";
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

  if (!isOpen || !appointment) return null;

  const handleClose = () => {
    setAccepted(false);
    onClose();
  };

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

        {/* ALTERAÇÃO: A mensagem agora informa sobre o reembolso automático */}
        <p className="mt-4 text-sm text-red-700">
          Ao confirmar, um <strong>reembolso automático</strong> será processado
          para o cliente através da sua conta Mercado Pago conectada. O horário
          ficará novamente disponível.
        </p>

        {/* ALTERAÇÃO: A confirmação agora é genérica */}
        <div className="mt-4">
          <label className="flex items-center gap-3 p-3 bg-red-50 rounded-md cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-semibold text-red-800">
              Entendo que esta ação é irreversível e irá reembolsar o cliente.
              Me compremeto a informar o cliente sobre o cancelamento.
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
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
