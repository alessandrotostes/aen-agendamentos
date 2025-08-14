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
  // PASSO 1: LOG INICIAL
  console.log("✅ --- PASSO 1: FUNÇÃO INICIADA ---");

  cors(request, response, async () => {
    try {
      // PASSO 2: INICIALIZAÇÃO DO STRIPE
      console.log("⏳ --- PASSO 2: TENTANDO INICIALIZAR O STRIPE... ---");
      stripe = new Stripe(stripeSecretKey.value());
      console.log("✅ --- STRIPE INICIALIZADO COM SUCESSO ---");

      // PASSO 3: VERIFICAÇÃO DE AUTORIZAÇÃO
      const authorization = request.headers.authorization;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        // Usamos throw para que o erro seja capturado pelo nosso catch principal
        throw new HttpsError(
          "unauthenticated",
          "Cabeçalho de autorização inválido."
        );
      }
      const idToken = authorization.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(
        `✅ --- PASSO 3: TOKEN VERIFICADO PARA UID: ${decodedToken.uid} ---`
      );

      // PASSO 4: VERIFICAÇÃO DO CORPO DA REQUISIÇÃO
      const { amount, paymentMethodId, appointmentDetails } = request.body;
      if (!amount || !paymentMethodId || !appointmentDetails) {
        throw new HttpsError(
          "invalid-argument",
          "Dados de pagamento ou agendamento inválidos."
        );
      }
      console.log("✅ --- PASSO 4: DADOS DO CORPO DA REQUISIÇÃO VÁLIDOS ---");

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

      // PASSO 5: CRIAÇÃO DO PAYMENT INTENT
      console.log(
        "⏳ --- PASSO 5: CHAMANDO A API DA STRIPE PARA CRIAR PAGAMENTO... ---"
      );
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
      console.log("✅ --- PAGAMENTO CRIADO COM SUCESSO NO STRIPE ---");

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
        throw new Error("O pagamento não foi bem-sucedido no Stripe.");
      }
    } catch (error: any) {
      // ESTE É O LOG MAIS IMPORTANTE! Ele vai nos dizer o erro exato.
      console.error("❌ --- ERRO FATAL CAPTURADO --- ❌", {
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      response
        .status(500)
        .send({
          error: "Erro interno na Cloud Function.",
          details: error.message,
        });
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
      refresh_url: "http://localhost:3000/owner", // Para onde voltar se o link expirar
      return_url: "http://localhost:3000/owner", // Para onde voltar após completar
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
