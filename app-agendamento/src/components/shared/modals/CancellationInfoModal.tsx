// src/components/modals/CancellationInfoModal.tsx

"use client";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancellationInfoModal({
  isOpen,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-800">
          Atenção ao Cancelamento
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          O cancelamento e o estorno do pagamento são realizados diretamente
          pelo estabelecimento. Contate o estabelecimento para finalizar o
          cancelamento.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Ao prosseguir, você notificará o estabelecimento sobre o seu desejo de
          cancelar. Por favor, entre em contato com eles para finalizar o
          processo.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-semibold hover:bg-teal-700"
          >
            Entendi, continuar
          </button>
        </div>
      </div>
    </div>
  );
}
