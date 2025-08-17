"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebaseConfig";
import { CreateAccountLinkResult, PendingAppointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { errorUtils } from "../lib/utils";

// Interface para o novo resultado da função combinada do backend
interface CreateAccountAndLinkResult {
  success: boolean;
  url?: string;
  accountId?: string;
}

// ========== STRIPE ACCOUNT HOOK (VERSÃO CORRIGIDA) ==========
export function useStripeAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // --- FUNÇÃO ALTERADA ---
  // Agora ela chama a função combinada e espera uma URL de volta.
  const createConnectedAccount =
    async (): Promise<CreateAccountAndLinkResult | null> => {
      if (!currentUser) {
        const authError = "Usuário não autenticado.";
        setError(authError);
        throw new Error(authError);
      }

      setLoading(true);
      setError(null);

      try {
        const createAccountFn = httpsCallable<void, CreateAccountAndLinkResult>(
          functions,
          "createconnectedaccount"
        );
        const result = await createAccountFn();

        // Retornamos o objeto de dados completo, que agora contém a URL.
        if (result.data.success) {
          return result.data;
        }
        throw new Error("Erro ao criar a conta conectada e o link.");
      } catch (err) {
        const errorMessage = errorUtils.getFirebaseErrorMessage(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

  // Esta função é mantida para o botão "Completar Configuração",
  // caso o usuário precise de um novo link.
  const createAccountLink = async (): Promise<string | null> => {
    if (!currentUser) throw new Error("Usuário não autenticado");
    try {
      setLoading(true);
      setError(null);
      const createLinkFn = httpsCallable<void, CreateAccountLinkResult>(
        functions,
        "createaccountlink"
      );
      const result = await createLinkFn();
      if (result.data.success) return result.data.url;
      throw new Error("Erro ao gerar link de configuração");
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createConnectedAccount, createAccountLink };
}

// ========== STRIPE PAYMENT HOOK (SEM ALTERAÇÕES) ==========
export interface PaymentData extends PendingAppointment {
  dateTime: Date;
}

export function useStripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const processPayment = async (
    paymentMethodId: string,
    paymentData: PaymentData
  ): Promise<{ success: boolean; paymentIntentId?: string }> => {
    if (!currentUser) {
      const authError = "Usuário não autenticado.";
      setError(authError);
      throw new Error(authError);
    }

    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethodId,
          appointmentDetails: {
            ...paymentData,
            bookingTimestamp: paymentData.dateTime.toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro no pagamento");
      }

      return { success: true, paymentIntentId: result.paymentIntentId };
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, processPayment };
}
