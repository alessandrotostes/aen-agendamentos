import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

// Definir que nossa função precisará do segredo que criamos
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

setGlobalOptions({
  region: "southamerica-east1",
  secrets: [stripeSecretKey],
});

// Inicializamos o Stripe dentro da função, quando ela for executada
let stripe: Stripe;

export const createpaymentintent = onCall(async (request) => {
  // Inicializamos o Stripe aqui, usando o valor do segredo
  stripe = new Stripe(stripeSecretKey.value(), {
    // CORREÇÃO: Usando a apiVersion exata que o seu ambiente exige
    apiVersion: "2025-07-30.basil",
  });

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  const { amount, paymentMethodId } = request.data;
  if (!amount || !paymentMethodId) {
    throw new HttpsError("invalid-argument", "Dados de pagamento inválidos.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "brl",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });
    console.log("Pagamento processado com sucesso:", paymentIntent.id);
    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error: any) {
    console.error("Erro no Stripe:", error);
    throw new HttpsError("internal", error.message);
  }
});
