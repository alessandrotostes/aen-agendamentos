import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { differenceInHours } from "date-fns";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({ origin: true });

admin.initializeApp();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

setGlobalOptions({
  region: "southamerica-east1",
});

// ===== FUNÇÃO 1: PROCESSAR PAGAMENTO COM SPLIT (onRequest) - VERSÃO CORRIGIDA =====
export const createpaymentintent = onRequest(
  { secrets: [stripeSecretKey] },
  async (request, response) => {
    cors(request, response, async () => {
      try {
        console.log("--- createpaymentintent: INICIADA ---");

        const stripe = new Stripe(stripeSecretKey.value());
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

        const applicationFee = Math.floor(amount * 0.1); // 10% de taxa de serviço (já com taxa do Stripe incluída)

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
          transfer_data: { destination: stripeAccountId },
        });
        console.log("Payment Intent criado com status:", paymentIntent.status);

        if (paymentIntent.status === "succeeded") {
          console.log(
            "Pagamento bem-sucedido. A preparar para salvar no Firestore..."
          );

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

          const professionalDoc = await admin
            .firestore()
            .collection("establishments")
            .doc(establishmentId)
            .collection("professionals")
            .doc(professionalId)
            .get();

          const professionalAuthUid = professionalDoc.data()?.authUid || null;
          const bookingDate = new Date(bookingTimestamp);

          const appointmentData = {
            clientId: decodedToken.uid,
            clientName: decodedToken.name || decodedToken.email,
            establishmentId,
            serviceId,
            professionalId,
            professionalAuthUid: professionalAuthUid,
            dateTime: Timestamp.fromDate(bookingDate),
            duration,
            price,
            status: "confirmado",
            serviceName,
            professionalName,
            paymentIntentId: paymentIntent.id,
          };

          try {
            console.log(
              `Tentando salvar agendamento em /establishments/${establishmentId}/appointments`
            );
            const docRef = await admin
              .firestore()
              .collection("establishments")
              .doc(establishmentId)
              .collection("appointments")
              .add(appointmentData);
            console.log(
              `SUCESSO: Documento de agendamento criado com o ID: ${docRef.id}`
            );
          } catch (firestoreError) {
            console.error(
              "ERRO CRÍTICO AO SALVAR NO FIRESTORE:",
              firestoreError
            );
            throw new Error(
              "Falha ao salvar o agendamento no banco de dados após o pagamento bem-sucedido."
            );
          }

          response
            .status(200)
            .send({ success: true, paymentIntentId: paymentIntent.id });
        } else {
          throw new Error("O pagamento não foi bem-sucedido no Stripe.");
        }
      } catch (error: any) {
        console.error("❌ Erro em createpaymentintent:", error.message);
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

    const stripe = new Stripe(stripeSecretKey.value());
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

// ===== FUNÇÃO 3: CRIAR LINK DE ONBOARDING (onCall) =====
export const createaccountlink = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }
    const stripe = new Stripe(stripeSecretKey.value());
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
    const stripe = new Stripe(stripeSecretKey.value());
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

// ===== FUNÇÃO 5: CANCELAR E REEMBOLSAR AGENDAMENTO (onCall) - VERSÃO CORRIGIDA =====
export const cancelAndRefundAppointment = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const uid = request.auth.uid;
    const { appointmentId, establishmentId } = request.data;

    if (!appointmentId || !establishmentId) {
      throw new HttpsError(
        "invalid-argument",
        "Os IDs do agendamento e do estabelecimento são obrigatórios."
      );
    }

    try {
      const appointmentRef = admin
        .firestore()
        .collection("establishments")
        .doc(establishmentId)
        .collection("appointments")
        .doc(appointmentId);

      const appointmentDoc = await appointmentRef.get();

      if (!appointmentDoc.exists) {
        throw new HttpsError("not-found", "Agendamento não encontrado.");
      }

      const appointment = appointmentDoc.data();

      if (appointment?.clientId !== uid) {
        throw new HttpsError(
          "permission-denied",
          "Você não tem permissão para cancelar este agendamento."
        );
      }

      const now = new Date();
      const appointmentTime = (appointment?.dateTime as Timestamp).toDate();
      if (differenceInHours(appointmentTime, now) < 6) {
        throw new HttpsError(
          "failed-precondition",
          "O cancelamento só pode ser feito com 6 horas de antecedência."
        );
      }

      const paymentIntentId = appointment?.paymentIntentId;
      if (!paymentIntentId) {
        await appointmentRef.update({ status: "cancelado" });
        return {
          success: true,
          message:
            "Agendamento cancelado. Nenhum pagamento associado para reembolsar.",
        };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      const applicationFeeAmount = paymentIntent.application_fee_amount || 0;
      const amountToRefund = paymentIntent.amount - applicationFeeAmount;

      if (amountToRefund > 0) {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amountToRefund,
        });
      }

      await appointmentRef.update({ status: "cancelado" });

      return {
        success: true,
        message: "Agendamento cancelado e reembolso processado.",
      };
    } catch (error: any) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Ocorreu um erro ao processar o cancelamento.",
        error.message
      );
    }
  }
);

// ===== FUNÇÃO 6: CONVIDAR PROFISSIONAL (onCall) =====
export const inviteProfessional = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    // 1. Validação de Segurança
    if (request.auth?.token.role !== "owner") {
      throw new HttpsError(
        "permission-denied",
        "Apenas proprietários podem convidar profissionais."
      );
    }

    const { professionalId } = request.data;
    if (!professionalId) {
      throw new HttpsError(
        "invalid-argument",
        "O ID do profissional é obrigatório."
      );
    }

    const ownerId = request.auth.uid;
    const professionalRef = admin
      .firestore()
      .collection("establishments")
      .doc(ownerId)
      .collection("professionals")
      .doc(professionalId);

    const professionalDoc = await professionalRef.get();

    if (!professionalDoc.exists) {
      throw new HttpsError("not-found", "Profissional não encontrado.");
    }

    const professionalData = professionalDoc.data();
    const email = professionalData?.email;

    if (!email) {
      throw new HttpsError(
        "failed-precondition",
        "Este profissional não tem um email cadastrado."
      );
    }

    if (professionalData?.authUid) {
      throw new HttpsError(
        "already-exists",
        "Este profissional já foi convidado."
      );
    }

    try {
      // 2. Criar o utilizador no Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        displayName: professionalData?.name,
        password: Math.random().toString(36).slice(-8),
      });

      // --- AQUI ESTÁ A CORREÇÃO ---
      // 3. Criar o documento do utilizador na coleção 'users'
      // Este passo acionará o nosso gatilho onUserRoleChange para definir o custom claim.
      console.log(
        `A criar documento na coleção 'users' para ${userRecord.uid}...`
      );
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        name: professionalData?.name,
        email: email,
        role: "professional", // Definimos o cargo aqui
        createdAt: Timestamp.now(),
      });
      // --- FIM DA CORREÇÃO ---

      // 4. Associar o novo ID de autenticação ao documento do profissional
      await professionalRef.update({
        authUid: userRecord.uid,
      });

      // 5. Gerar o link de redefinição de senha (o Firebase envia o email)
      await admin.auth().generatePasswordResetLink(email);

      return { success: true, message: "Convite enviado com sucesso!" };
    } catch (error: any) {
      console.error("Erro ao criar utilizador para profissional:", error);
      if (error.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "Este email já está a ser utilizado."
        );
      }
      throw new HttpsError(
        "internal",
        "Ocorreu um erro inesperado ao processar o convite."
      );
    }
  }
);

// ===== FUNÇÃO DE GATILHO: SINCRONIZAR CARGO DO UTILIZADOR =====
export const onUserRoleChange = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    if (!event.data?.after.exists) {
      return null;
    }

    const newRole = event.data.after.data()?.role;
    const oldRole = event.data.before.data()?.role;

    if (newRole === oldRole) {
      return null;
    }

    try {
      const userId = event.params.userId;
      await admin.auth().setCustomUserClaims(userId, { role: newRole });
      console.log(
        `Custom claim for user ${userId} successfully set to '${newRole}'.`
      );
      return { success: true };
    } catch (error) {
      console.error("Error setting custom user claims:", error);
      return { success: false, error: error };
    }
  }
);

// ===== FUNÇÃO 7: REENVIAR CONVITE DO PROFISSIONAL (onCall) =====
export const resendInvite = onCall(async (request) => {
  if (request.auth?.token.role !== "owner") {
    throw new HttpsError(
      "permission-denied",
      "Apenas proprietários podem reenviar convites."
    );
  }

  const { professionalId } = request.data;
  if (!professionalId) {
    throw new HttpsError(
      "invalid-argument",
      "O ID do profissional é obrigatório."
    );
  }

  const ownerId = request.auth.uid;
  const professionalRef = admin
    .firestore()
    .collection("establishments")
    .doc(ownerId)
    .collection("professionals")
    .doc(professionalId);

  const professionalDoc = await professionalRef.get();

  if (!professionalDoc.exists) {
    throw new HttpsError("not-found", "Profissional não encontrado.");
  }

  const professionalData = professionalDoc.data();
  const email = professionalData?.email;

  if (!email) {
    throw new HttpsError(
      "failed-precondition",
      "Este profissional não tem um email cadastrado para o qual reenviar o convite."
    );
  }

  if (!professionalData?.authUid) {
    throw new HttpsError(
      "failed-precondition",
      "Este profissional ainda não foi convidado. Use a função 'Convidar' primeiro."
    );
  }

  try {
    await admin.auth().generatePasswordResetLink(email);
    console.log(`Email de redefinição de senha reenviado para ${email}.`);

    return { success: true, message: "Convite reenviado com sucesso!" };
  } catch (error: any) {
    throw new HttpsError(
      "internal",
      "Ocorreu um erro inesperado ao reenviar o convite."
    );
  }
});
// ===== FUNÇÃO 8: OBTER DISPONIBILIDADE DE UM PROFISSIONAL (onCall) =====
export const getProfessionalAvailability = onCall(async (request) => {
  // Qualquer utilizador logado pode verificar a disponibilidade
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar logado para ver os horários."
    );
  }

  const { establishmentId, professionalId, date } = request.data;
  if (!establishmentId || !professionalId || !date) {
    throw new HttpsError(
      "invalid-argument",
      "IDs do estabelecimento, profissional e a data são obrigatórios."
    );
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = admin
      .firestore()
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .where("professionalId", "==", professionalId)
      .where("status", "==", "confirmado")
      .where("dateTime", ">=", Timestamp.fromDate(startOfDay))
      .where("dateTime", "<=", Timestamp.fromDate(endOfDay));

    const snapshot = await q.get();

    if (snapshot.empty) {
      return []; // Nenhum agendamento, todos os horários estão livres
    }

    // Processamos os dados no backend para enviar apenas o necessário
    const bookedSlots = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        // Enviamos a data/hora em formato ISO string para ser facilmente usada no frontend
        dateTime: (data.dateTime as Timestamp).toDate().toISOString(),
        duration: data.duration as number,
      };
    });

    return bookedSlots;
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível buscar os horários disponíveis."
    );
  }
});
