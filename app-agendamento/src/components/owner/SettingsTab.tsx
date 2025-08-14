"use client";

import React from "react";
import type { Establishment, Availability } from "../../types";

// CORREÇÃO: A interface de StripeData foi alinhada com o OwnerView
interface StripeData {
  hasStripeAccount: boolean;
  isStripeOnboarded: boolean;
  loading: boolean;
  error: string | null;
  createConnectedAccount: () => Promise<void>;
  createAccountLink: () => Promise<void>;
}

interface Props {
  establishment: Establishment | null;
  stripeData: StripeData;
  onEditEstablishment: () => void;
  onEditAvailability: () => void;
}

export default function SettingsTab({
  establishment,
  stripeData,
  onEditEstablishment,
  onEditAvailability,
}: Props) {
  const renderSchedule = (availability: Availability | undefined) => {
    if (!availability || Object.keys(availability).length === 0) {
      return (
        <p className="text-sm text-gray-500">
          Nenhum horário de funcionamento definido.
        </p>
      );
    }
    const daysOrder = [
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
      "domingo",
    ];
    const dayLabels: { [key: string]: string } = {
      segunda: "Segunda-feira",
      terca: "Terça-feira",
      quarta: "Quarta-feira",
      quinta: "Quinta-feira",
      sexta: "Sexta-feira",
      sabado: "Sábado",
      domingo: "Domingo",
    };
    return (
      <div className="space-y-1">
        {daysOrder.map((dayKey) => {
          const schedule = availability[dayKey];
          return (
            <div key={dayKey} className="flex justify-between text-sm">
              <span className="capitalize text-gray-700">
                {dayLabels[dayKey]}:
              </span>
              <span className="font-medium text-gray-900">
                {schedule ? `${schedule.start} - ${schedule.end}` : "Fechado"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Perfil do Estabelecimento
          </h3>
          <button
            onClick={onEditEstablishment}
            className="text-sm font-medium text-teal-600 hover:text-teal-800"
          >
            Editar Perfil
          </button>
        </div>
        <div className="space-y-2 border-t pt-4 text-gray-700">
          <p>
            <strong>Nome:</strong> {establishment?.name || "Não informado"}
          </p>
          <p>
            <strong>Endereço:</strong>{" "}
            {establishment?.address || "Não informado"}
          </p>
          <p>
            <strong>Telefone:</strong> {establishment?.phone || "Não informado"}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Horários de Funcionamento
          </h3>
          <button
            onClick={onEditAvailability}
            className="text-sm font-medium text-teal-600 hover:text-teal-800"
          >
            Editar Horários
          </button>
        </div>
        <div className="border-t pt-4">
          {renderSchedule(establishment?.availability)}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-indigo-600 mr-2">💳</span> Pagamentos Online
        </h3>
        <div className="border-t pt-4">
          {stripeData.error && (
            <div className="p-3 bg-red-50 text-red-700 rounded mb-4">
              {stripeData.error}
            </div>
          )}
          {stripeData.hasStripeAccount ? (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">
                ✅ Conta Stripe Conectada
              </p>
              {!stripeData.isStripeOnboarded && (
                <p className="text-sm text-green-700 mt-1">
                  Complete a configuração para receber pagamentos.
                </p>
              )}
              <button
                onClick={stripeData.createAccountLink}
                disabled={stripeData.loading}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
              >
                {stripeData.loading ? "Gerando..." : "Painel de Pagamentos"}
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800">
                Conecte-se ao Stripe para receber pagamentos
              </p>
              <button
                onClick={stripeData.createConnectedAccount}
                disabled={stripeData.loading}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
              >
                {stripeData.loading ? "Conectando..." : "Conectar com Stripe"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
