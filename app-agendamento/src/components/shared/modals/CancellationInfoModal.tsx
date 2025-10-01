"use client";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

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
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">
            Atenção à Política de Cancelamento
          </h3>
        </div>

        {/* NOVO TEXTO ESTRUTURADO */}
        <div className="mt-4 space-y-4 text-sm text-gray-600">
          <p>
            Por favor, revise as regras antes de continuar. O seu direito ao
            reembolso depende da antecedência do seu pedido:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-800">
                  Reembolso Integral (100%)
                </strong>
                <p className="text-emerald-700 text-xs">
                  Garantido por lei ou pela plataforma nestas condições:
                </p>
                <ul className="list-disc list-inside text-emerald-700 text-xs mt-1">
                  <li>
                    Até <strong>7 dias</strong> após a compra (Direito de
                    Arrependimento).
                  </li>
                  <li>
                    A qualquer momento, se o cancelamento for feito com mais de{" "}
                    <strong>3 horas</strong> de antecedência do horário
                    agendado.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-800">
                  Menos de 3 horas de antecedência
                </strong>
                <p className="text-amber-700 text-xs">
                  O reembolso automático pela plataforma não está disponível.
                  Você deverá{" "}
                  <strong>contactar o estabelecimento diretamente</strong> para
                  negociar um possível reembolso, conforme as regras do local.
                </p>
              </div>
            </div>
          </div>
        </div>

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
