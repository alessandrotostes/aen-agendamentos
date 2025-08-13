"use client";

import React from "react";
import Image from "next/image";
import { Establishment } from "../../types";

interface StripeData {
  hasStripeAccount: boolean;
  isStripeOnboarded: boolean;
  loading: boolean;
  error: string | null;
  createConnectedAccount: () => Promise<string | null>;
  createAccountLink: () => Promise<string | null>;
}

interface Props {
  establishment: Establishment | null;
  stripeData: StripeData;
  onEditEstablishment: () => void;
}

export default function SettingsTab({
  establishment,
  stripeData,
  onEditEstablishment,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Card de Perfil do Estabelecimento */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Perfil do Estabelecimento
          </h3>
          <button
            onClick={onEditEstablishment}
            className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
          >
            Editar Perfil
          </button>
        </div>
        <div className="space-y-3 border-t pt-4 text-gray-700">
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
          <p>
            <strong>Serviço Principal:</strong>{" "}
            {establishment?.mainService || "Não informado"}
          </p>
          {establishment?.imageURL && (
            <div className="pt-2">
              <p className="font-semibold mb-2">Logo:</p>
              <Image
                src={establishment.imageURL}
                alt="Logo do Estabelecimento"
                width={100}
                height={100}
                className="rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card de Pagamentos Online */}
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
                  Complete a configuração no Stripe para começar a receber
                  pagamentos.
                </p>
              )}
              <button
                onClick={stripeData.createAccountLink}
                disabled={stripeData.loading}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
                className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
