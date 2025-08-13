"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../lib/firebaseConfig"; // ✅ Importar auth
import {
  CreateConnectedAccountResult,
  CreateAccountLinkResult,
  CreatePaymentIntentData,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import { errorUtils, currencyUtils } from "../lib/utils";

// ========== STRIPE ACCOUNT HOOK ==========
export function useStripeAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Criar conta conectada Stripe
  const createConnectedAccount = async (): Promise<string | null> => {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    try {
      setLoading(true);
      setError(null);

      const createAccount = httpsCallable<void, CreateConnectedAccountResult>(
        functions,
        "createconnectedaccount"
      );

      const result = await createAccount();

      if (result.data.success) {
        return result.data.accountId;
      } else {
        throw new Error("Erro ao criar conta Stripe");
      }
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Criar link de onboarding
  const createAccountLink = async (): Promise<string | null> => {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    try {
      setLoading(true);
      setError(null);

      const createLink = httpsCallable<void, CreateAccountLinkResult>(
        functions,
        "createaccountlink"
      );

      const result = await createLink();

      if (result.data.success) {
        return result.data.url;
      } else {
        throw new Error("Erro ao gerar link de configuração");
      }
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createConnectedAccount,
    createAccountLink,
  };
}

// ========== STRIPE PAYMENT HOOK ==========
interface PaymentData {
  serviceId: string;
  professionalId: string;
  establishmentId: string;
  dateTime: Date;
  serviceName: string;
  professionalName: string;
  price: number;
  duration: number;
}

export function useStripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Processar pagamento com agendamento
  const processPayment = async (
    paymentMethodId: string,
    paymentData: PaymentData
  ): Promise<{ success: boolean; paymentIntentId?: string }> => {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar dados para a Cloud Function
      const requestData: CreatePaymentIntentData = {
        amount: currencyUtils.toCents(paymentData.price),
        paymentMethodId,
        appointmentDetails: {
          establishmentId: paymentData.establishmentId,
          serviceId: paymentData.serviceId,
          professionalId: paymentData.professionalId,
          bookingTimestamp: paymentData.dateTime.toISOString(),
          duration: paymentData.duration,
          price: paymentData.price,
          serviceName: paymentData.serviceName,
          professionalName: paymentData.professionalName,
        },
      };

      // ✅ CORREÇÃO: Usar auth.currentUser para getIdToken
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("Usuário do Firebase não encontrado");
      }

      const token = await firebaseUser.getIdToken(); // ✅ Agora funciona

      // Fazer requisição para a Cloud Function (onRequest)
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          paymentIntentId: result.paymentIntentId,
        };
      } else {
        throw new Error(result.error || "Erro no pagamento");
      }
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processPayment,
  };
}

// ========== STRIPE UTILITIES ==========
export const stripeUtils = {
  // Formatar valor para exibição
  formatAmount: (amountInCents: number): string => {
    return currencyUtils.format(currencyUtils.fromCents(amountInCents));
  },

  // Calcular taxa da plataforma (7%)
  calculatePlatformFee: (amount: number): number => {
    return Math.floor(amount * 0.07);
  },

  // Calcular valor que o estabelecimento recebe
  calculateEstablishmentAmount: (totalAmount: number): number => {
    return totalAmount - stripeUtils.calculatePlatformFee(totalAmount);
  },

  // Validar se valor é válido para Stripe (mínimo R$ 0,50)
  isValidAmount: (amount: number): boolean => {
    return amount >= 0.5 && amount <= 999999.99;
  },

  // Gerar descrição para o pagamento
  generatePaymentDescription: (
    serviceName: string,
    establishmentName: string
  ): string => {
    return `${serviceName} - ${establishmentName}`;
  },
};
