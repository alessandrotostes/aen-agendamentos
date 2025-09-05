import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
// Importações de gatilhos de documento do Firestore v2
import {
  onDocumentWritten,
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import { MercadoPagoConfig, OAuth, Preference, Payment } from "mercadopago";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore(); // Definindo o db uma vez aqui para ser usado globalmente
db.settings({ ignoreUndefinedProperties: true });

// Use a URL do seu túnel aqui para os testes
const aplicationBaseUrl = "https://aenagendamentos.vercel.app";

// Definição de todos os segredos necessários
const mercadoPagoAppId = defineSecret("MERCADOPAGO_APP_ID");
const mercadoPagoAccessToken = defineSecret("MERCADOPAGO_ACCESS_TOKEN");
const mercadoPagoPublicKey = defineSecret("MERCADOPAGO_PUBLIC_KEY");
const mercadoPagoSecretKey = defineSecret("MERCADOPAGO_SECRET_KEY");
const mercadoPagoWebhookSecret = defineSecret("MERCADOPAGO_WEBHOOK_SECRET");

// Configurações globais para todas as funções
setGlobalOptions({
  region: "southamerica-east1",
  secrets: [
    mercadoPagoAppId,
    mercadoPagoAccessToken,
    mercadoPagoPublicKey,
    mercadoPagoSecretKey,
    mercadoPagoWebhookSecret,
  ],
});

// ========================================================================
// ===== FUNÇÃO 1: GERAR LINK DE ONBOARDING DO MERCADO PAGO
// ========================================================================
export const generateMercadoPagoOnboardingLink = onCall(
  { secrets: [mercadoPagoAppId] },
  async (request) => {
    if (request.auth?.token.role !== "owner") {
      throw new HttpsError(
        "permission-denied",
        "Apenas proprietários podem conectar uma conta."
      );
    }
    const ownerId = request.auth.uid;
    const state = `owner_${ownerId}_${Date.now()}`;
    await db
      .collection("establishments")
      .doc(ownerId)
      .update({ mpAuthState: state });

    const redirectUri = `${aplicationBaseUrl}/owner/mp-redirect`;
    const authUrl = [
      "https://auth.mercadopago.com.br/authorization?",
      `client_id=${mercadoPagoAppId.value()}`,
      `&response_type=code`,
      `&platform_id=mp`,
      `&state=${state}`,
      `&redirect_uri=${encodeURIComponent(redirectUri)}`,
      `&scope=offline_access`,
    ].join("");

    return { url: authUrl };
  }
);

// ===================================================================================
// ===== FUNÇÃO 2: TROCAR CÓDIGO DE AUTORIZAÇÃO POR CREDENCIAIS
// ===================================================================================
export const exchangeCodeForCredentials = onCall(
  { secrets: [mercadoPagoAppId, mercadoPagoSecretKey, mercadoPagoAccessToken] },
  async (request) => {
    if (request.auth?.token.role !== "owner") {
      throw new HttpsError(
        "permission-denied",
        "Apenas proprietários podem completar a conexão."
      );
    }
    const { code, state } = request.data;
    if (!code || !state) {
      throw new HttpsError(
        "invalid-argument",
        "O código de autorização e o parâmetro 'state' são obrigatórios."
      );
    }
    const ownerId = request.auth.uid;
    const establishmentRef = db.collection("establishments").doc(ownerId);
    const doc = await establishmentRef.get();
    const savedState = doc.data()?.mpAuthState;

    if (!savedState || savedState !== state) {
      throw new HttpsError(
        "permission-denied",
        "O 'state' da autorização é inválido. Tente novamente."
      );
    }

    await establishmentRef.update({ mpAuthState: null });

    try {
      const currentAppId = mercadoPagoAppId.value();
      const currentSecret = mercadoPagoSecretKey.value();
      const platformAccessToken = mercadoPagoAccessToken.value();
      const client = new MercadoPagoConfig({
        accessToken: platformAccessToken,
      });
      const oauth = new OAuth(client);

      const redirectUri = `${aplicationBaseUrl}/owner/mp-redirect`;

      const credentials = await oauth.create({
        body: {
          client_secret: currentSecret,
          client_id: currentAppId,
          code: code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        } as any,
      });

      const mpCredentials = {
        mp_user_id: credentials.user_id,
        mp_access_token: credentials.access_token,
        mp_refresh_token: credentials.refresh_token,
        mp_public_key: credentials.public_key,
        mp_connected_at: Timestamp.now(),
      };

      await establishmentRef.set({ mpCredentials }, { merge: true });

      return {
        success: true,
        message: "Conta do Mercado Pago conectada com sucesso!",
      };
    } catch (error: any) {
      console.error("ERRO DETALHADO NA TROCA DE CÓDIGO:", error.cause ?? error);
      throw new HttpsError(
        "internal",
        "Não foi possível conectar a conta do Mercado Pago."
      );
    }
  }
);

// ============================================================================
// ===== FUNÇÃO 3: CRIAR PREFERÊNCIA DE PAGAMENTO (CHECKOUT PRO)
// ============================================================================
export const createMercadoPagoPreference = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar logado para pagar."
    );
  }
  const { transaction_amount, payer, appointmentDetails } = request.data;

  try {
    const { establishmentId, professionalId, bookingTimestamp, duration } =
      appointmentDetails;
    const requestedStartTime = new Date(bookingTimestamp).getTime();
    const requestedEndTime = requestedStartTime + duration * 60 * 1000;

    const appointmentsRef = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments");
    const snapshot = await appointmentsRef
      .where("professionalId", "==", professionalId)
      .where("status", "==", "confirmado")
      .get();

    let isSlotTaken = false;
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const booking = doc.data();
        const existingStartTime = (booking.dateTime as Timestamp).toMillis();
        const existingEndTime =
          existingStartTime + booking.duration * 60 * 1000;

        if (
          requestedStartTime < existingEndTime &&
          requestedEndTime > existingStartTime
        ) {
          isSlotTaken = true;
        }
      });
    }

    if (isSlotTaken) {
      throw new HttpsError(
        "already-exists",
        "Desculpe, este horário acabou de ser reservado. Por favor, escolha outro."
      );
    }
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    console.error("Erro ao verificar disponibilidade:", error);
    throw new HttpsError(
      "internal",
      "Erro ao verificar a disponibilidade do horário."
    );
  }

  const establishmentDoc = await db
    .collection("establishments")
    .doc(appointmentDetails.establishmentId)
    .get();

  if (!establishmentDoc.exists) {
    throw new HttpsError("not-found", "Estabelecimento não encontrado.");
  }

  const ownerCredentials = establishmentDoc.data()?.mpCredentials;
  const ownerAccessToken = ownerCredentials?.mp_access_token;

  console.log(
    "DEBUG: Access Token do Vendedor que será usado:",
    ownerAccessToken
  );

  if (!ownerAccessToken) {
    throw new HttpsError(
      "failed-precondition",
      "Este estabelecimento não está conectado para receber pagamentos."
    );
  }

  const client = new MercadoPagoConfig({
    accessToken: ownerAccessToken,
  });
  const preference = new Preference(client);
  const application_fee = Math.floor(transaction_amount * 0.07 * 100) / 100;

  try {
    const preferenceBody = {
      items: [
        {
          id: appointmentDetails.serviceId,
          title: `Agendamento: ${appointmentDetails.serviceName}`,
          description: `Com ${appointmentDetails.professionalName}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: transaction_amount,
        },
      ],
      payer: { first_name: payer.first_name, email: payer.email },
      back_urls: {
        success: `${aplicationBaseUrl}/client`,
        failure: `${aplicationBaseUrl}/checkout/failure`,
        pending: `${aplicationBaseUrl}/client`,
      },
      auto_return: "approved",
      marketplace_fee: application_fee,
      metadata: { appointmentDetails, clientId: request.auth.uid },
      external_reference: `APP_${request.auth.uid}_${Date.now()}`,
      notification_url:
        "https://southamerica-east1-webappagendamento-1c932.cloudfunctions.net/mercadoPagoWebhook",
    };
    console.log(
      "DEBUG: Enviando Preference Body para o MP:",
      JSON.stringify(preferenceBody, null, 2)
    );
    const preferenceResponse = await preference.create({
      body: preferenceBody,
    });
    console.log(
      "DEBUG: Resposta da criação da preferência:",
      preferenceResponse
    );
    const initPoint = preferenceResponse.sandbox_init_point
      ? preferenceResponse.sandbox_init_point
      : preferenceResponse.init_point;
    return { success: true, init_point: initPoint };
  } catch (error: any) {
    console.error("ERRO ao criar preferência:", error.cause ?? error);
    throw new HttpsError("internal", "Erro ao iniciar o pagamento.");
  }
});

// ====================================================================
// ===== FUNÇÃO 4: WEBHOOK DO MERCADO PAGO (VERSÃO SEGURA)
// ====================================================================
export const mercadoPagoWebhook = onRequest(
  { secrets: [mercadoPagoAccessToken, mercadoPagoWebhookSecret] },
  async (request, response) => {
    try {
      const eventId =
        request.body?.data?.id || request.query?.id || request.query["data.id"];
      const topic = request.body?.type || request.query?.topic || "payment";

      if (!eventId) {
        response.status(200).send("OK (sem ID de evento)");
        return;
      }

      const signature = request.headers["x-signature"] as string;
      const requestId = request.headers["x-request-id"] as string;

      if (signature && requestId) {
        const parts = signature.split(",").reduce((acc, part) => {
          const [key, value] = part.split("=");
          acc[key.trim()] = value.trim();
          return acc;
        }, {} as Record<string, string>);
        const ts = parts.ts;
        const v1 = parts.v1;
        const secret = mercadoPagoWebhookSecret.value();
        const manifest = `id:${eventId};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(manifest);
        const hash = hmac.digest("hex");
        if (hash !== v1) {
          console.error(
            "Assinatura do Webhook inválida! A notificação foi descartada."
          );
          response.status(401).send("Assinatura inválida.");
          return;
        }
      }

      if (topic === "payment") {
        const paymentId = String(eventId);
        const client = new MercadoPagoConfig({
          accessToken: mercadoPagoAccessToken.value(),
        });
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });

        if (
          paymentInfo.status === "approved" &&
          paymentInfo.metadata?.appointment_details
        ) {
          const appointmentDetailsFromMP = paymentInfo.metadata
            .appointment_details as any;
          const clientId = paymentInfo.metadata.client_id as string;

          const appointmentsRef = db
            .collection("establishments")
            .doc(appointmentDetailsFromMP.establishment_id)
            .collection("appointments");
          const existingAppointment = await appointmentsRef
            .where("paymentId", "==", paymentId)
            .limit(1)
            .get();

          if (!existingAppointment.empty) {
            console.log(
              `O agendamento para o pagamento ${paymentId} já existe. A ignorar.`
            );
          } else {
            const bookingDate = new Date(
              appointmentDetailsFromMP.booking_timestamp
            );
            const professionalDoc = await db
              .collection("establishments")
              .doc(appointmentDetailsFromMP.establishment_id)
              .collection("professionals")
              .doc(appointmentDetailsFromMP.professional_id)
              .get();
            const professionalAuthUid = professionalDoc.data()?.authUid || null;

            await appointmentsRef.add({
              clientId: clientId,
              clientName:
                paymentInfo.payer?.first_name || paymentInfo.payer?.email,
              establishmentId: appointmentDetailsFromMP.establishment_id,
              serviceId: appointmentDetailsFromMP.service_id,
              professionalId: appointmentDetailsFromMP.professional_id,
              professionalAuthUid: professionalAuthUid,
              dateTime: Timestamp.fromDate(bookingDate),
              duration: appointmentDetailsFromMP.duration,
              price: appointmentDetailsFromMP.price,
              status: "confirmado",
              serviceName: appointmentDetailsFromMP.service_name,
              professionalName: appointmentDetailsFromMP.professional_name,
              paymentId: paymentInfo.id,
              paymentProvider: "mercadopago_connect",
            });
            console.log(
              `SUCESSO: Agendamento para o pagamento ${paymentId} criado.`
            );
          }
        } else {
          console.log(
            `Pagamento ${paymentId} não está no estado 'approved' ou não tem metadados. Status: ${paymentInfo.status}`
          );
        }
      }

      response.status(200).send("OK");
    } catch (error) {
      console.error("Erro fatal no processamento do webhook:", error);
      response.status(500).send("Erro interno ao processar webhook.");
    }
  }
);

// ====================================================================================
// ===== FUNÇÃO 5A: CLIENTE CANCELA AGENDAMENTO (COM REGRA DE 3 HORAS)
// ====================================================================================
export const clientCancelAppointment = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }
    const { appointmentId, establishmentId } = request.data;
    if (!appointmentId || !establishmentId) {
      throw new HttpsError(
        "invalid-argument",
        "IDs do agendamento e do estabelecimento são obrigatórios."
      );
    }

    const appointmentRef = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      throw new HttpsError("not-found", "Agendamento não encontrado.");
    }
    if (appointmentDoc.data()?.clientId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "Você não pode alterar este agendamento."
      );
    }

    // --- LÓGICA DA REGRA DE 3 HORAS ADICIONADA AQUI ---
    const appointmentTime = (
      appointmentDoc.data()?.dateTime as Timestamp
    ).toDate();
    const now = new Date();
    const hoursDifference =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 3) {
      throw new HttpsError(
        "failed-precondition",
        "O cancelamento só é permitido com um mínimo de 3 horas de antecedência."
      );
    }
    // --- FIM DA LÓGICA DA REGRA ---

    await appointmentRef.update({
      status: "cancelado",
      cancelledBy: "client",
      cancellationTimestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: "O seu agendamento foi cancelado com sucesso.",
    };
  } catch (error) {
    console.error("Erro em clientCancelAppointment:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao cancelar o agendamento."
    );
  }
});

// =================================================================================
// ===== FUNÇÃO 5B: OWNER CANCELA AGENDAMENTO
// =================================================================================
export const ownerCancelAppointment = onCall(async (request) => {
  // CORREÇÃO: Adicionado try...catch para segurança
  try {
    if (request.auth?.token.role !== "owner") {
      throw new HttpsError(
        "permission-denied",
        "Apenas o proprietário do estabelecimento pode cancelar agendamentos."
      );
    }
    const { appointmentId, establishmentId } = request.data;
    if (!appointmentId || !establishmentId) {
      throw new HttpsError(
        "invalid-argument",
        "IDs do agendamento e do estabelecimento são obrigatórios."
      );
    }

    if (request.auth.uid !== establishmentId) {
      throw new HttpsError(
        "permission-denied",
        "Você não tem permissão sobre este estabelecimento."
      );
    }

    const appointmentRef = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .doc(appointmentId);

    const appointmentDoc = await appointmentRef.get();
    if (!appointmentDoc.exists) {
      throw new HttpsError("not-found", "Agendamento não encontrado.");
    }

    await appointmentRef.update({
      status: "cancelado",
      cancelledBy: "owner",
      cancellationTimestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: "Agendamento cancelado e horário liberado com sucesso.",
    };
  } catch (error) {
    console.error("Erro em ownerCancelAppointment:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao cancelar o agendamento."
    );
  }
});

// ============================================================================
// ===== FUNÇÃO 6: OBTER DISPONIBILIDADE DE UM PROFISSIONAL
// ============================================================================
export const getProfessionalAvailability = onCall(async (request) => {
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
    const q = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .where("professionalId", "==", professionalId)
      .where("status", "==", "confirmado")
      .where("dateTime", ">=", Timestamp.fromDate(startOfDay))
      .where("dateTime", "<=", Timestamp.fromDate(endOfDay));
    const snapshot = await q.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        dateTime: (data.dateTime as Timestamp).toDate().toISOString(),
        duration: data.duration as number,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível buscar os horários disponíveis."
    );
  }
});

// ===============================================================
// ===== FUNÇÃO 7: SINCRONIZAR CARGO DO UTILIZADOR
// ===============================================================
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

// ==========================================================
// ===== FUNÇÃO 8: CONVIDAR PROFISSIONAL
// ==========================================================
export const inviteProfessional = onCall(async (request) => {
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
  const professionalRef = db
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
    const userRecord = await admin.auth().createUser({
      email: email,
      displayName: professionalData?.name,
      password: Math.random().toString(36).slice(-8),
    });
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: professionalData?.name,
      email: email,
      role: "professional",
      createdAt: Timestamp.now(),
    });
    await professionalRef.update({ authUid: userRecord.uid });
    const link = await admin.auth().generatePasswordResetLink(email);
    // TODO: Enviar o link por email para o profissional.
    console.log("Link de convite gerado:", link);
    return { success: true, message: "Convite enviado com sucesso!" };
  } catch (error: any) {
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
});

// ====================================================================
// ===== FUNÇÃO 9: REENVIAR CONVITE DO PROFISSIONAL
// ====================================================================
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
  const professionalRef = db
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
  if (!professionalData?.authUid) {
    throw new HttpsError(
      "failed-precondition",
      "Este profissional ainda não foi convidado."
    );
  }
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    // TODO: Enviar o link por email para o profissional.
    console.log("Link de convite reenviado:", link);
    return { success: true, message: "Convite reenviado com sucesso!" };
  } catch (error: any) {
    throw new HttpsError(
      "internal",
      "Ocorreu um erro inesperado ao reenviar o convite."
    );
  }
});

// ====================================================================
// ===== FUNÇÃO 10: CONTADOR DE FAVORITOS
// ====================================================================
/**
 * Gatilho executado quando um novo documento de favorito é criado.
 * Incrementa o contador de favoritos no estabelecimento correspondente.
 */
export const onFavoriteCreate = onDocumentCreated(
  "users/{userId}/favorites/{establishmentId}",
  async (event) => {
    const establishmentId = event.params.establishmentId;
    const establishmentRef = db
      .collection("establishments")
      .doc(establishmentId);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(establishmentRef);
        // Pega o contador atual, ou assume 0 se não existir.
        const currentCount = doc.data()?.favoritesCount || 0;
        const newCount = currentCount + 1;
        transaction.update(establishmentRef, { favoritesCount: newCount });
      });
      console.log(
        `[TRANSACTION SUCCESS] Contador de favoritos incrementado para o estabelecimento: ${establishmentId}`
      );
    } catch (error) {
      console.error(
        `[TRANSACTION ERROR] Erro ao incrementar contador para ${establishmentId}:`,
        error
      );
    }
  }
);

/**
 * Gatilho executado quando um documento de favorito é deletado.
 * Decrementa o contador de favoritos no estabelecimento correspondente.
 */
export const onFavoriteDelete = onDocumentDeleted(
  "users/{userId}/favorites/{establishmentId}",
  async (event) => {
    const establishmentId = event.params.establishmentId;
    const establishmentRef = db
      .collection("establishments")
      .doc(establishmentId);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(establishmentRef);
        const currentCount = doc.data()?.favoritesCount || 0;

        // A MÁGICA ESTÁ AQUI: garante que o resultado seja 0 ou maior.
        const newCount = Math.max(0, currentCount - 1);

        transaction.update(establishmentRef, { favoritesCount: newCount });
      });
      console.log(
        `[TRANSACTION SUCCESS] Contador de favoritos decrementado para o estabelecimento: ${establishmentId}`
      );
    } catch (error) {
      console.error(
        `[TRANSACTION ERROR] Erro ao decrementar contador para ${establishmentId}:`,
        error
      );
    }
  }
);
