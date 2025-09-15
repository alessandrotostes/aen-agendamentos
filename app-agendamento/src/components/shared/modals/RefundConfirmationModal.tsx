"use client";
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function RefundConfirmationModal({
  isOpen,
  onConfirm,
  onClose,
  isLoading,
}: Props) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-800">
          Confirmação de Reembolso
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          As politicas de reembolso serão aplicadas conforme o horário do
          cancelamento. Ao confirmar, um reembolso automático será processado
          diretamente na conta em que foi realizado o pagamento.
        </p>
        <div className="mt-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Política de cancelamento: Mais de 24h: reembolso 100% <br />
              3h a 24h: reembolso 80%
              <br />
              Menos de 3h: sem reembolso, salvo casos excepcionais (nesse caso
              contate o estabelecimento para efetuação do cancelamento)
              <br /> Declaro que li e estou ciente das políticas e condições de
              reembolso.
            </span>
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
            {isLoading ? "A enviar..." : "Confirmar Solicitação"}
          </button>
        </div>
      </div>
    </div>
  );
}
