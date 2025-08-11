import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({ origin: true });

admin.initializeApp();
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

setGlobalOptions({
  region: "southamerica-east1",
  secrets: [stripeSecretKey],
});

let stripe: Stripe;

// ===== FUNÇÃO 1: PROCESSAR PAGAMENTO COM SPLIT (onRequest) =====
export const createpaymentintent = onRequest(async (request, response) => {
  cors(request, response, async () => {
    stripe = new Stripe(stripeSecretKey.value());

    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      response.status(401).send({ error: "Unauthorized" });
      return;
    }
    let decodedToken;
    const idToken = authorization.split("Bearer ")[1];
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      response.status(401).send({ error: "Unauthorized" });
      return;
    }

    const { amount, paymentMethodId, appointmentDetails } = request.body;
    if (!amount || !paymentMethodId || !appointmentDetails) {
      response
        .status(400)
        .send({ error: "Dados de pagamento ou agendamento inválidos." });
      return;
    }

    try {
      // 1. Buscar o ID da conta Stripe do estabelecimento no Firestore
      const establishmentDoc = await admin
        .firestore()
        .collection("establishments")
        .doc(appointmentDetails.establishmentId)
        .get();
      const stripeAccountId = establishmentDoc.data()?.stripeAccountId;

      if (!stripeAccountId) {
        throw new Error(
          "O estabelecimento não está configurado para receber pagamentos."
        );
      }

      // 2. Calcular a nossa comissão (7%)
      const applicationFee = Math.floor(amount * 0.07);

      // 3. Criar o PaymentIntent com os dados para o split
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "brl",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        // A lógica do SPLIT acontece aqui
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: stripeAccountId,
        },
      });

      if (paymentIntent.status === "succeeded") {
        const {
          establishmentId,
          serviceId,
          professionalId,
          bookingTimestamp,
          duration,
          price,
          serviceName,
          professionalName,
        } = appointmentDetails;
        const bookingDate = new Date(bookingTimestamp);
        await admin
          .firestore()
          .collection("appointments")
          .add({
            clientId: decodedToken.uid,
            clientName: decodedToken.name || decodedToken.email,
            establishmentId,
            serviceId,
            professionalId,
            dateTime: Timestamp.fromDate(bookingDate),
            duration,
            price,
            status: "confirmado",
            serviceName,
            professionalName,
          });
        response
          .status(200)
          .send({ success: true, paymentIntentId: paymentIntent.id });
      } else {
        response
          .status(400)
          .send({ error: "O pagamento não foi bem-sucedido." });
      }
    } catch (error: any) {
      console.error("Erro no Stripe ou Firestore:", error);
      response.status(500).send({ error: error.message });
    }
  });
});

// ===== FUNÇÃO 2: CRIAR CONTA CONECTADA (onCall) =====
export const createconnectedaccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email;

  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  if (userDoc.data()?.role !== "owner") {
    throw new HttpsError(
      "permission-denied",
      "Apenas proprietários podem criar contas."
    );
  }

  stripe = new Stripe(stripeSecretKey.value());

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "BR",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const establishmentRef = admin
      .firestore()
      .collection("establishments")
      .doc(uid);
    await establishmentRef.update({
      stripeAccountId: account.id,
    });

    return { success: true, accountId: account.id };
  } catch (error: any) {
    console.error("Erro ao criar conta conectada no Stripe:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível criar a conta de pagamento.",
      error.message
    );
  }
});

// ===== FUNÇÃO 3: CRIAR LINK DE ONBOARDING (onCall) =====
export const createaccountlink = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  const uid = request.auth.uid;

  const establishmentDoc = await admin
    .firestore()
    .collection("establishments")
    .doc(uid)
    .get();
  const stripeAccountId = establishmentDoc.data()?.stripeAccountId;

  if (!stripeAccountId) {
    throw new HttpsError(
      "failed-precondition",
      "Este estabelecimento não tem uma conta Stripe conectada."
    );
  }

  stripe = new Stripe(stripeSecretKey.value());

  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: "http://localhost:3000/dashboard", // Para onde voltar se o link expirar
      return_url: "http://localhost:3000/dashboard", // Para onde voltar após completar
      type: "account_onboarding",
    });

    return { success: true, url: accountLink.url };
  } catch (error: any) {
    console.error("Erro ao criar link de conta:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível gerar o link de onboarding do Stripe."
    );
  }
});
