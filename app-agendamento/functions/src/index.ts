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
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

setGlobalOptions({
  region: "southamerica-east1",
});

let stripe: Stripe;
const initializeStripe = () => {
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey.value());
  }
};

// ===== FUNÇÃO 1: PROCESSAR PAGAMENTO COM SPLIT (onRequest) =====
export const createpaymentintent = onRequest(
  { secrets: [stripeSecretKey] },
  async (request, response) => {
    cors(request, response, async () => {
      try {
        initializeStripe();
        const authorization = request.headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
          throw new HttpsError(
            "unauthenticated",
            "Cabeçalho de autorização inválido."
          );
        }
        const idToken = authorization.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const { amount, paymentMethodId, appointmentDetails } = request.body;
        if (!amount || !paymentMethodId || !appointmentDetails) {
          throw new HttpsError(
            "invalid-argument",
            "Dados de pagamento ou agendamento inválidos."
          );
        }

        const establishmentDoc = await admin
          .firestore()
          .collection("establishments")
          .doc(appointmentDetails.establishmentId)
          .get();
        if (!establishmentDoc.exists) {
          throw new Error("Estabelecimento não encontrado.");
        }
        const stripeAccountId = establishmentDoc.data()?.stripeAccountId;

        if (!stripeAccountId) {
          throw new Error(
            "O estabelecimento não está configurado para receber pagamentos."
          );
        }

        const applicationFee = Math.floor(amount * 0.07);

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "brl",
          payment_method: paymentMethodId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
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
              paymentIntentId: paymentIntent.id,
            });
          response
            .status(200)
            .send({ success: true, paymentIntentId: paymentIntent.id });
        } else {
          throw new Error("O pagamento não foi bem-sucedido no Stripe.");
        }
      } catch (error: any) {
        console.error("❌ Erro em createpaymentintent:", {
          errorCode: error.code,
          errorMessage: error.message,
        });
        response.status(500).send({
          error: "Erro interno na Cloud Function.",
          details: error.message,
        });
      }
    });
  }
);

// ===== FUNÇÃO 2: CRIAR CONTA E LINK DE ONBOARDING (onCall) =====
export const createconnectedaccount = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    initializeStripe();
    const uid = request.auth.uid;
    const email = request.auth.token.email;

    const userDocRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists || userDoc.data()?.role !== "owner") {
      throw new HttpsError(
        "permission-denied",
        "Apenas proprietários podem criar contas."
      );
    }

    const establishmentRef = admin
      .firestore()
      .collection("establishments")
      .doc(uid);
    const establishmentDoc = await establishmentRef.get();

    if (!establishmentDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Documento de estabelecimento não encontrado."
      );
    }

    let stripeAccountId = establishmentDoc.data()?.stripeAccountId;

    if (stripeAccountId) {
      try {
        await stripe.accounts.retrieve(stripeAccountId);
        console.log(`Conta Stripe ${stripeAccountId} já existe e é válida.`);
      } catch (error) {
        console.warn(
          "ID da conta Stripe existente era inválido. A criar uma nova conta.",
          error
        );
        stripeAccountId = null;
      }
    }

    if (!stripeAccountId) {
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
        stripeAccountId = account.id;
        await establishmentRef.update({
          stripeAccountId: stripeAccountId,
          stripeAccountOnboarded: false,
        });
        console.log(
          `Nova conta ${stripeAccountId} criada para o estabelecimento ${uid}.`
        );
      } catch (error: any) {
        console.error("Erro ao criar nova conta conectada no Stripe:", error);
        throw new HttpsError(
          "internal",
          "Não foi possível criar a conta de pagamento.",
          error.message
        );
      }
    }

    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: "http://localhost:3000/owner",
        return_url: "http://localhost:3000/owner",
        type: "account_onboarding",
      });
      return { success: true, url: accountLink.url };
    } catch (error: any) {
      console.error("Erro ao criar link de conta para conta existente:", error);
      throw new HttpsError(
        "internal",
        "Não foi possível gerar o link de onboarding do Stripe."
      );
    }
  }
);

// ===== FUNÇÃO 3: CRIAR LINK DE ONBOARDING (onCall) - MANTIDA POR SEGURANÇA =====
export const createaccountlink = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }
    initializeStripe();
    const uid = request.auth.uid;

    const establishmentDoc = await admin
      .firestore()
      .collection("establishments")
      .doc(uid)
      .get();
    if (!establishmentDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Documento de estabelecimento não encontrado."
      );
    }
    const stripeAccountId = establishmentDoc.data()?.stripeAccountId;

    if (!stripeAccountId) {
      throw new HttpsError(
        "failed-precondition",
        "Este estabelecimento não tem uma conta Stripe conectada."
      );
    }

    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: "http://localhost:3000/owner",
        return_url: "http://localhost:3000/owner",
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
  }
);

// ===== FUNÇÃO 4: WEBHOOK LISTENER DO STRIPE =====
export const stripewebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (request, response) => {
    initializeStripe();
    const webhookSecret = stripeWebhookSecret.value();

    if (!webhookSecret) {
      console.error(
        "Erro Crítico: Segredo do Webhook (STRIPE_WEBHOOK_SECRET) não foi encontrado!"
      );
      response.status(500).send("Configuração do servidor incompleta.");
      return;
    }

    const sig = request.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error(
        `Erro na verificação da assinatura do webhook: ${err.message}`
      );
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const isOnboarded = account.charges_enabled && account.details_submitted;

      try {
        const querySnapshot = await admin
          .firestore()
          .collection("establishments")
          .where("stripeAccountId", "==", account.id)
          .limit(1)
          .get();
        if (!querySnapshot.empty) {
          const establishmentDoc = querySnapshot.docs[0];
          await establishmentDoc.ref.update({
            stripeAccountOnboarded: isOnboarded,
          });
          console.log(
            `Estabelecimento ${establishmentDoc.id} atualizado para onboarded=${isOnboarded}.`
          );
        } else {
          console.warn(
            `Webhook recebido para conta Stripe ${account.id}, mas nenhum estabelecimento correspondente foi encontrado.`
          );
        }
      } catch (dbError) {
        console.error(
          "Erro ao tentar atualizar o estabelecimento no Firestore:",
          dbError
        );
      }
    }

    response.status(200).json({ received: true });
  }
);
