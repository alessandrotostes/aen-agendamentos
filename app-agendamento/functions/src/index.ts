import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
// Importações de gatilhos de documento do Firestore v2
import {
  onDocumentWritten,
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import {
  MercadoPagoConfig,
  OAuth,
  Preference,
  Payment,
  PaymentRefund,
} from "mercadopago";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore(); // Definindo o db uma vez aqui para ser usado globalmente
db.settings({ ignoreUndefinedProperties: true });

// Use a URL do seu túnel aqui para os testes
const aplicationBaseUrl = "https://aenagendamentos.com.br";

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
  const clientId = request.auth.uid;

  const { transaction_amount, appointmentDetails } = request.data;
  if (!transaction_amount || !appointmentDetails) {
    throw new HttpsError(
      "invalid-argument",
      "Detalhes do agendamento e valor são obrigatórios."
    );
  }
  const { establishmentId, professionalId, bookingTimestamp } =
    appointmentDetails;

  // --- BUSCAR DADOS DO CLIENTE E DO ESTABELECIMENTO ---
  const clientDoc = await db.collection("users").doc(clientId).get();
  if (!clientDoc.exists) {
    throw new HttpsError(
      "not-found",
      "Os dados do cliente não foram encontrados."
    );
  }
  const clientData = clientDoc.data();
  if (!clientData?.firstName || !clientData?.lastName || !clientData?.email) {
    throw new HttpsError(
      "failed-precondition",
      "Os dados do perfil do cliente estão incompletos."
    );
  }

  const establishmentDoc = await db
    .collection("establishments")
    .doc(establishmentId)
    .get();
  if (!establishmentDoc.exists) {
    throw new HttpsError("not-found", "Estabelecimento não encontrado.");
  }
  const establishmentData = establishmentDoc.data();
  const ownerAccessToken = establishmentData?.mpCredentials?.mp_access_token;
  if (!ownerAccessToken) {
    throw new HttpsError(
      "failed-precondition",
      "Este estabelecimento não está conectado para receber pagamentos."
    );
  }

  // --- VERIFICAR DISPONIBILIDADE DO HORÁRIO ---
  try {
    const requestedStartTime = new Date(bookingTimestamp);
    if (requestedStartTime < new Date()) {
      throw new HttpsError(
        "failed-precondition",
        "Não é possível agendar em um horário que já passou."
      );
    }
    const appointmentsRef = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments");
    const snapshot = await appointmentsRef
      .where("professionalId", "==", professionalId)
      .where("status", "==", "confirmado")
      .where("dateTime", "==", Timestamp.fromDate(requestedStartTime))
      .get();
    if (!snapshot.empty) {
      throw new HttpsError(
        "already-exists",
        "Desculpe, este horário acabou de ser reservado. Por favor, escolha outro."
      );
    }
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error("Erro ao verificar disponibilidade:", error);
    throw new HttpsError(
      "internal",
      "Erro ao verificar a disponibilidade do horário."
    );
  }

  // ==========================================================
  // ===== ALTERAÇÃO: LÓGICA DE COBRANÇA DE MULTAS ===========
  // ==========================================================
  const penaltiesRef = db.collection(
    `establishments/${establishmentId}/penalties`
  );
  const pendingPenaltiesQuery = penaltiesRef.where("status", "==", "pending");
  const penaltiesSnapshot = await pendingPenaltiesQuery.get();

  let totalFineAmount = 0;
  const penaltyIdsToPay: string[] = [];
  if (!penaltiesSnapshot.empty) {
    penaltiesSnapshot.forEach((doc) => {
      totalFineAmount += doc.data().amount;
      penaltyIdsToPay.push(doc.id);
    });
    logger.info(
      `Adicionando ${totalFineAmount} em multas pendentes para o estabelecimento ${establishmentId}.`
    );
  }

  const normalApplicationFee = transaction_amount * 0.0499; // Sua taxa de 4.99%
  const finalApplicationFee = normalApplicationFee + totalFineAmount;

  // Garantir que a taxa não exceda o valor da transação e arredondar para 2 casas decimais
  const cappedFee =
    Math.round(Math.min(transaction_amount, finalApplicationFee) * 100) / 100;
  // ==========================================================
  // =================== FIM DA ALTERAÇÃO =====================
  // ==========================================================

  const client = new MercadoPagoConfig({ accessToken: ownerAccessToken });
  const preference = new Preference(client);

  try {
    const newAppointmentRef = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .doc();
    const appointmentId = newAppointmentRef.id;

    const professionalDoc = await db
      .collection("establishments")
      .doc(establishmentId)
      .collection("professionals")
      .doc(professionalId)
      .get();
    const professionalAuthUid = professionalDoc.data()?.authUid || null;

    const establishmentNameClean = (establishmentData?.name || "Servico")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 10);
    const statementDescriptor = `AN_${establishmentNameClean}`;

    const preferenceBody = {
      items: [
        {
          id: appointmentDetails.serviceId,
          title: `Agendamento: ${appointmentDetails.serviceName}`,
          description: `Com ${appointmentDetails.professionalfirstName}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: transaction_amount,
        },
      ],
      payer: {
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
      },
      back_urls: {
        success: `${aplicationBaseUrl}/client/`,
        failure: `${aplicationBaseUrl}/client`,
        pending: `${aplicationBaseUrl}/client/`,
      },
      auto_return: "approved",
      marketplace_fee: cappedFee, // <-- Usar a taxa final calculada
      statement_descriptor: statementDescriptor,
      metadata: {
        appointmentId: appointmentId,
        establishmentId: establishmentId,
        paid_penalty_ids: penaltyIdsToPay, // <-- Enviar os IDs das multas para o webhook
      },
      external_reference: appointmentId,
      notification_url:
        "https://southamerica-east1-aen-agendamentos-produca-f8e06.cloudfunctions.net/mercadoPagoWebhook",
    };

    const preferenceResponse = await preference.create({
      body: preferenceBody,
    });

    const finalBookingDate = new Date(bookingTimestamp);
    await newAppointmentRef.set({
      ...appointmentDetails,
      dateTime: Timestamp.fromDate(finalBookingDate),
      clientId: clientId,
      clientFirstName: clientData.firstName,
      clientLastName: clientData.lastName,
      clientPhone: clientData.phone || "",
      professionalAuthUid,
      status: "pending_payment",
      preferenceId: preferenceResponse.id,
      createdAt: Timestamp.now(),
    });

    return { success: true, init_point: preferenceResponse.init_point };
  } catch (error: any) {
    logger.error(
      "ERRO DETALhado AO CRIAR PREFERÊNCIA:",
      JSON.stringify(error, null, 2)
    );
    throw new HttpsError("internal", "Erro ao iniciar o pagamento.");
  }
});

// FUNÇÃO 4: WEBHOOK DO MERCADO PAGO (VERSÃO FINAL E CORRETA)
export const mercadoPagoWebhook = onRequest(
  { secrets: ["MERCADOPAGO_ACCESS_TOKEN"] }, // Certifique-se que o segredo está declarado aqui
  async (request, response) => {
    try {
      const topic = request.body?.type || request.query?.topic;

      if (topic === "payment") {
        const paymentId = String(request.body?.data?.id || request.query?.id);
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken) {
          logger.error(
            "Access Token do Mercado Pago não configurado nos segredos."
          );
          response.status(500).send("Erro de configuração interna.");
          return;
        }

        const payment = new Payment(
          new MercadoPagoConfig({ accessToken: accessToken })
        );
        const paymentInfo = await payment.get({ id: paymentId });

        const appointmentId = paymentInfo.external_reference;
        const establishmentId = paymentInfo.metadata?.establishment_id;

        if (!appointmentId || !establishmentId) {
          logger.warn(
            "Webhook recebido sem appointmentId ou establishmentId no metadata.",
            { paymentInfo }
          );
          response.status(200).send("OK (dados insuficientes)");
          return;
        }

        const appointmentRef = db
          .collection("establishments")
          .doc(establishmentId)
          .collection("appointments")
          .doc(appointmentId);

        const appointmentDoc = await appointmentRef.get();
        if (!appointmentDoc.exists) {
          logger.warn(
            `Agendamento ${appointmentId} não encontrado no webhook.`
          );
          response.status(200).send("OK (agendamento não encontrado)");
          return;
        }

        const paymentStatus = paymentInfo.status;
        const currentAppointmentStatus = appointmentDoc.data()?.status;

        logger.info(
          `Webhook recebido para o agendamento ${appointmentId}. Status do pagamento: ${paymentStatus}. Status atual do agendamento: ${currentAppointmentStatus}`
        );

        // --- LÓGICA DE PAGAMENTO APROVADO ---
        if (paymentStatus === "approved") {
          if (currentAppointmentStatus === "pending_payment") {
            await appointmentRef.update({
              status: "confirmado",
              paymentId: paymentId,
            });
            logger.info(`SUCESSO: Agendamento ${appointmentId} confirmado.`);
          }
        }

        // --- LÓGICA DE REEMBOLSO (para fluxos automáticos e manuais) ---
        else if (
          paymentStatus === "refunded" ||
          paymentStatus === "partially_refunded"
        ) {
          // Atua se o status for 'pending_refund' (cancelamento automático)
          // OU 'confirmado' (cancelamento manual fora da plataforma).
          if (
            currentAppointmentStatus === "pending_refund" ||
            currentAppointmentStatus === "confirmado"
          ) {
            await appointmentRef.update({
              status: "cancelado",
              cancelledBy: "owner", // Assumimos que o dono iniciou o reembolso manual neste caso
              cancellationReason: "Reembolso processado via Mercado Pago.",
              cancellationTimestamp: Timestamp.now(),
            });
            logger.info(
              `SUCESSO: Reembolso do agendamento ${appointmentId} validado e agendamento cancelado.`
            );
          }
        }

        // --- LÓGICA DE PAGAMENTO FALHADO ---
        else if (
          ["rejected", "cancelled", "failed"].includes(paymentStatus as string)
        ) {
          if (currentAppointmentStatus === "pending_payment") {
            await appointmentRef.update({
              status: "cancelado",
              cancellationReason: `Pagamento falhou com status: ${paymentStatus}`,
            });
            logger.info(
              `Agendamento ${appointmentId} cancelado (status: ${paymentStatus}).`
            );
          }
        }
      }

      response.status(200).send("OK");
    } catch (error) {
      logger.error("Erro fatal no processamento do webhook:", error);
      response.status(500).send("Erro interno ao processar webhook.");
    }
  }
);

// ====================================================================================
// ===== FUNÇÃO 5A: CLIENTE CANCELA AGENDAMENTO (COM REGRA DE 3 HORAS)
// ====================================================================================
export const clientCancelAppointment = onCall(async (request) => {
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
  const appointmentData = appointmentDoc.data()!;

  if (appointmentData.clientId !== request.auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "Você não pode alterar este agendamento."
    );
  }

  const appointmentTime = (appointmentData.dateTime as Timestamp).toDate();
  const now = new Date();
  const hoursDifference =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDifference < 3) {
    throw new HttpsError(
      "failed-precondition",
      "O cancelamento só é permitido com um mínimo de 3 horas de antecedência."
    );
  }

  const paymentId = appointmentData.paymentId;
  if (!paymentId) {
    await appointmentRef.update({
      status: "cancelado",
      cancelledBy: "client",
      cancellationTimestamp: Timestamp.now(),
    });
    return {
      success: true,
      message: "Agendamento cancelado com sucesso (sem pagamento).",
    };
  }

  try {
    const establishmentDoc = await db
      .collection("establishments")
      .doc(establishmentId)
      .get();
    const ownerAccessToken =
      establishmentDoc.data()?.mpCredentials?.mp_access_token;

    if (!ownerAccessToken) {
      throw new HttpsError(
        "failed-precondition",
        "O estabelecimento não está configurado para processar reembolsos automáticos."
      );
    }

    const client = new MercadoPagoConfig({ accessToken: ownerAccessToken });

    // ALTERAÇÃO 2: Instanciar a classe correta 'PaymentRefund'
    const refund = new PaymentRefund(client);
    await refund.create({
      payment_id: paymentId,
    });

    logger.info(
      `Reembolso automático iniciado com sucesso para o pagamento ${paymentId}`
    );

    await appointmentRef.update({
      status: "refunded",
      cancelledBy: "client",
      cancellationTimestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: "Agendamento cancelado e reembolso processado com sucesso!",
    };
  } catch (error: any) {
    logger.error(
      `Falha no reembolso automático para o pagamento ${paymentId}:`,
      error
    );

    await appointmentRef.update({
      status: "pending_refund",
      cancelledBy: "client",
      cancellationTimestamp: Timestamp.now(),
      refundRequestedAt: Timestamp.now(),
      refundError: error.message || "Erro desconhecido na API de reembolso.",
    });

    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao processar o reembolso automático. O estabelecimento foi notificado para processar manualmente."
    );
  }
});

// =================================================================================
// ===== FUNÇÃO 5B: OWNER CANCELA AGENDAMENTO
// =================================================================================
export const ownerCancelAppointment = onCall(async (request) => {
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
    const appointmentData = appointmentDoc.data()!;

    // --- LÓGICA DE REEMBOLSO AUTOMÁTICO COMEÇA AQUI ---
    const paymentId = appointmentData.paymentId;
    if (!paymentId) {
      // Se não houver ID de pagamento (ex: agendamento gratuito), apenas cancela no sistema
      await appointmentRef.update({
        status: "cancelado",
        cancelledBy: "owner",
        cancellationTimestamp: Timestamp.now(),
      });
      return {
        success: true,
        message: "Agendamento cancelado com sucesso (sem pagamento associado).",
      };
    }

    try {
      const establishmentDoc = await db
        .collection("establishments")
        .doc(establishmentId)
        .get();
      const ownerAccessToken =
        establishmentDoc.data()?.mpCredentials?.mp_access_token;

      if (!ownerAccessToken) {
        throw new HttpsError(
          "failed-precondition",
          "O estabelecimento não está configurado para processar reembolsos automáticos."
        );
      }

      const client = new MercadoPagoConfig({ accessToken: ownerAccessToken });
      const refund = new PaymentRefund(client);

      await refund.create({
        payment_id: paymentId,
      });

      logger.info(
        `Reembolso automático iniciado pelo proprietário para o pagamento ${paymentId}`
      );

      // Atualiza o status final no Firestore
      await appointmentRef.update({
        status: "refunded", // O status já é o final, pois o reembolso foi processado
        cancelledBy: "owner",
        cancellationTimestamp: Timestamp.now(),
      });

      return {
        success: true,
        message: "Agendamento cancelado e reembolso processado com sucesso!",
      };
    } catch (error: any) {
      logger.error(
        `Falha no reembolso automático iniciado pelo proprietário para o pagamento ${paymentId}:`,
        error
      );

      // PLANO B: Se o reembolso automático falhar, aciona o fluxo manual
      await appointmentRef.update({
        status: "pending_refund", // Volta ao status de reembolso pendente
        cancelledBy: "owner",
        cancellationTimestamp: Timestamp.now(),
        refundRequestedAt: Timestamp.now(), // Inicia o contador de 5 dias
        refundError: `(OWNER) ${
          error.message || "Erro desconhecido na API de reembolso."
        }`,
      });

      throw new HttpsError(
        "internal",
        "Ocorreu um erro ao processar o reembolso automático. Notificámos o cliente e o reembolso deve ser feito manualmente."
      );
    }
    // --- FIM DA LÓGICA DE REEMBOLSO AUTOMÁTICO ---
  } catch (error) {
    logger.error("Erro em ownerCancelAppointment:", error);
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
    // --- CORREÇÃO DE FUSO HORÁRIO ---
    // A data vem do cliente como uma string ISO (ex: "2024-09-17T12:00:00.000Z").
    // Para evitar problemas de fuso, criamos a data baseada em UTC.
    const requestedDate = new Date(date);
    const year = requestedDate.getUTCFullYear();
    const month = requestedDate.getUTCMonth();
    const day = requestedDate.getUTCDate();

    // Cria o início e o fim do dia em UTC para garantir que a consulta
    // ao Firestore seja consistente, não importa onde o servidor esteja.
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

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
      // ALTERAÇÃO 1: Usar 'firstName' do perfil do profissional
      displayName: professionalData?.firstName,
      password: Math.random().toString(36).slice(-8),
    });

    // Criamos o documento na coleção principal de utilizadores
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      // ALTERAÇÃO 2: Salvar como 'firstName' para padronizar
      firstName: professionalData?.firstName,
      email: email,
      role: "professional",
      // ADIÇÃO IMPORTANTE: Guardar o ID do estabelecimento a que ele pertence
      establishmentId: ownerId,
      createdAt: Timestamp.now(),
    });

    await professionalRef.update({ authUid: userRecord.uid });
    const link = await admin.auth().generatePasswordResetLink(email);
    // TODO: Enviar o link por email para o profissional.
    console.log("Link de convite gerado:", link);
    return { success: true, message: "Convite enviado com sucesso!" };
  } catch (error: any) {
    if (error.code === "auth/email-already-exists") {
      // Se o email já existe na autenticação, podemos tentar vincular a conta existente
      // Esta é uma lógica mais avançada, por agora lançamos o erro.
      throw new HttpsError(
        "already-exists",
        "Este email já está a ser utilizado por outra conta."
      );
    }
    console.error("Erro detalhado ao convidar profissional:", error);
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
    // =================================================================
    // ===== CORREÇÃO ADICIONADA AQUI ==================================
    // Adicionamos um log para ver o erro original no painel do Firebase
    console.error("Erro detalhado ao gerar link de reset:", error);
    // =================================================================
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
/**
 * Gera um 'slug' URL-amigável a partir de um texto.
 * Ex: "Salão da Maria" -> "salao-da-maria"
 */
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/\s+/g, "-") // Troca espaços por hífens
    .replace(/[^\w\-]+/g, "") // Remove todos os caracteres não-alfanuméricos (exceto hífens)
    .replace(/\-\-+/g, "-"); // Remove hífens duplicados
}

/**
 * Gatilho do Firestore que gera e salva um 'slug' para um estabelecimento
 * sempre que ele é criado ou o nome é atualizado.
 */
export const onEstablishmentWritten = onDocumentWritten(
  "establishments/{establishmentId}",
  async (event) => {
    // Acessa os dados do documento antes e depois da alteração
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Se o documento foi deletado ou o nome não mudou, não fazemos nada.
    if (!afterData || beforeData?.name === afterData.name) {
      console.log(
        "Nenhuma alteração de nome detectada. O slug não será gerado."
      );
      return null;
    }

    const establishmentName = afterData.name;
    if (!establishmentName) {
      console.log(
        "O nome do estabelecimento está vazio. O slug não será gerado."
      );
      return null;
    }

    const baseSlug = generateSlug(establishmentName);
    let finalSlug = baseSlug;
    let counter = 1;

    // Loop para garantir que o slug seja único
    while (true) {
      const q = db.collection("establishments").where("slug", "==", finalSlug);
      const snapshot = await q.get();

      if (snapshot.empty) {
        // Se não encontrou nenhum documento com este slug, ele é único!
        break;
      }

      // Se o slug já existe, adiciona um número no final e tenta de novo.
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log(`Slug gerado para '${establishmentName}': ${finalSlug}`);
    // Salva o slug único de volta no documento do estabelecimento.
    return event.data?.after.ref.set({ slug: finalSlug }, { merge: true });
  }
);
// ====================================================================
// ===== ALTERAÇÃO 2: NOVA FUNÇÃO PARA MONITORAR REEMBOLSOS
// ====================================================================
/**
 * Corre a cada 24 horas para verificar agendamentos com reembolsos pendentes
 * há mais de 5 dias e aplica as penalidades necessárias.
 */
export const monitorarReembolsos = onSchedule(
  "every 24 hours",
  async (event) => {
    logger.info("A iniciar a verificação de reembolsos atrasados...");

    const now = new Date();
    const fiveDaysAgo = new Date(now.setDate(now.getDate() - 5));
    const fiveDaysAgoTimestamp = Timestamp.fromDate(fiveDaysAgo);

    const overdueRefundsQuery = db
      .collectionGroup("appointments")
      .where("status", "==", "pending_refund")
      .where("refundRequestedAt", "<=", fiveDaysAgoTimestamp);

    try {
      const snapshot = await overdueRefundsQuery.get();
      if (snapshot.empty) {
        logger.info("Nenhum reembolso atrasado encontrado.");
        // CORREÇÃO: A linha 'return null;' foi removida daqui.
        return;
      }

      logger.info(
        `Encontrados ${snapshot.size} reembolsos atrasados. A processar...`
      );

      const promises = snapshot.docs.map(async (doc) => {
        const appointment = doc.data();
        const { establishmentId, clientId, price } = appointment;

        const establishmentRef = db
          .collection("establishments")
          .doc(establishmentId);

        await establishmentRef.update({ accountStatus: "suspended" });

        const fineValue = price * 0.1;
        await establishmentRef.collection("penalties").add({
          reason: `Atraso no reembolso do agendamento ${doc.id}`,
          amount: fineValue,
          createdAt: Timestamp.now(),
          appointmentId: doc.id,
          status: "pending",
        });

        const clientRef = db.collection("users").doc(clientId);
        await clientRef.collection("notifications").add({
          title: "Atraso no seu Reembolso",
          message: `O estabelecimento não processou o seu reembolso a tempo. A A&N está a mediar a situação. A conta do estabelecimento foi suspensa.`,
          createdAt: Timestamp.now(),
          isRead: false,
        });

        await doc.ref.update({
          status: "refund_overdue",
        });

        logger.info(
          `Penalidades aplicadas ao estabelecimento ${establishmentId} para o agendamento ${doc.id}`
        );
      });

      await Promise.all(promises);
      logger.info("Processamento de reembolsos atrasados concluído.");
    } catch (error) {
      logger.error("Ocorreu um erro ao monitorizar reembolsos:", error);
    }
    // CORREÇÃO: A linha 'return null;' foi removida do final da função.
  }
);
export const cleanupPendingPayments = onSchedule(
  "every 24 hours",
  async (event) => {
    logger.info(
      "Iniciando a limpeza de agendamentos com pagamentos pendentes expirados..."
    );

    // 1. Calcular a data limite (24 horas atrás)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twentyFourHoursAgoTimestamp = Timestamp.fromDate(twentyFourHoursAgo);

    // 2. Criar a consulta para encontrar os agendamentos expirados
    const expiredAppointmentsQuery = db
      .collectionGroup("appointments") // Busca em todos os estabelecimentos
      .where("status", "==", "pending_payment")
      .where("createdAt", "<=", twentyFourHoursAgoTimestamp);

    try {
      const snapshot = await expiredAppointmentsQuery.get();
      if (snapshot.empty) {
        logger.info("Nenhum agendamento pendente expirado encontrado.");
        return;
      }

      logger.info(
        `Encontrados ${snapshot.size} agendamentos expirados. Iniciando a remoção...`
      );

      // 3. Apagar os documentos em lote (batch) para eficiência
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(
        `SUCESSO: ${snapshot.size} agendamentos expirados foram removidos.`
      );
    } catch (error) {
      logger.error("Ocorreu um erro ao limpar os pagamentos pendentes:", error);
    }
  }
);
// ===============================================================
// ===== FUNÇÃO PARA DEFINIR CUSTOM CLAIMS INICIAIS
// ===============================================================
export const setInitialUserClaims = onCall(async (request) => {
  // Apenas utilizadores autenticados podem chamar esta função
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const uid = request.auth.uid;
  const { role } = request.data;

  // Validar a role recebida
  if (!["owner", "client", "professional"].includes(role)) {
    throw new HttpsError("invalid-argument", "A role fornecida é inválida.");
  }

  try {
    // Define o custom claim para o utilizador que fez a chamada
    await admin.auth().setCustomUserClaims(uid, { role: role });
    return {
      success: true,
      message: `Claim '${role}' definida com sucesso para o utilizador ${uid}.`,
    };
  } catch (error) {
    console.error("Erro ao definir custom claim:", error);
    throw new HttpsError(
      "internal",
      "Não foi possível definir as permissões do utilizador."
    );
  }
});
// ===============================================================
// ===== FUNÇÃO PARA EXCLUIR CONTA DO CLIENTE
// ===============================================================
export const deleteClientAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar autenticado para excluir a conta."
    );
  }

  const uid = request.auth.uid;
  const db = admin.firestore(); // Certifique-se de que 'db' está inicializado

  try {
    const appointmentsQuery = db
      .collectionGroup("appointments")
      .where("clientId", "==", uid);

    const appointmentsSnapshot = await appointmentsQuery.get();

    if (!appointmentsSnapshot.empty) {
      const batch = db.batch();
      appointmentsSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          clientFirstName: "Usuário",
          clientLastName: "Removido",
          clientId: null,
        });
      });
      await batch.commit();
    }

    await db.collection("users").doc(uid).delete();

    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    console.error(`Falha ao excluir a conta do usuário ${uid}:`, error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao processar a exclusão da sua conta.",
      error
    );
  }
});
// ============================================================================
// ===== FUNÇÃO: EXCLUIR PROFISSIONAL (PELO DONO)
// ============================================================================
export const deleteProfessional = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Ação não autorizada.");
  }

  const ownerUid = request.auth.uid;
  const { establishmentId, professionalId } = request.data;

  if (!establishmentId || !professionalId) {
    throw new HttpsError("invalid-argument", "IDs são obrigatórios.");
  }

  const db = admin.firestore();
  const professionalRef = db
    .collection("establishments")
    .doc(establishmentId)
    .collection("professionals")
    .doc(professionalId);

  try {
    const professionalDoc = await professionalRef.get();
    if (!professionalDoc.exists) {
      throw new HttpsError("not-found", "Profissional não encontrado.");
    }
    const professionalData = professionalDoc.data();

    // 1. Verificação de segurança: O solicitante é o dono do estabelecimento?
    const establishmentRef = db
      .collection("establishments")
      .doc(establishmentId);
    const establishmentDoc = await establishmentRef.get();
    if (
      !establishmentDoc.exists ||
      establishmentDoc.data()?.ownerId !== ownerUid
    ) {
      throw new HttpsError(
        "permission-denied",
        "Você não tem permissão para realizar esta ação."
      );
    }

    // 2. Lidar com agendamentos futuros (IMPORTANTE)
    // Para simplificar, vamos impedir a exclusão se houver agendamentos futuros.
    // Uma lógica mais avançada poderia cancelá-los e notificar os clientes.
    const futureAppointmentsQuery = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .where("professionalId", "==", professionalId)
      .where("dateTime", ">", admin.firestore.Timestamp.now());

    const futureAppointments = await futureAppointmentsQuery.get();
    if (!futureAppointments.empty) {
      throw new HttpsError(
        "failed-precondition",
        "Este profissional possui agendamentos futuros. Cancele-os antes de excluir."
      );
    }

    // 3. Anonimizar agendamentos passados (opcional, mas boa prática)
    const pastAppointmentsQuery = db
      .collection("establishments")
      .doc(establishmentId)
      .collection("appointments")
      .where("professionalId", "==", professionalId)
      .where("dateTime", "<=", admin.firestore.Timestamp.now());

    const pastAppointments = await pastAppointmentsQuery.get();
    if (!pastAppointments.empty) {
      const batch = db.batch();
      pastAppointments.forEach((doc) => {
        batch.update(doc.ref, {
          professionalfirstName: "Profissional Removido",
        });
      });
      await batch.commit();
    }

    // 4. Excluir o documento do profissional
    await professionalRef.delete();

    // 5. Excluir a conta de autenticação do profissional, se existir
    if (professionalData?.authUid) {
      try {
        await admin.auth().deleteUser(professionalData.authUid);
      } catch (error: any) {
        // Ignora o erro se o usuário já tiver sido excluído, mas loga para auditoria
        if (error.code !== "auth/user-not-found") {
          console.error(
            `Falha ao excluir Auth UID ${professionalData.authUid} para o profissional ${professionalId}`,
            error
          );
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    // Repassa o erro específico (ex: 'failed-precondition') para o frontend
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error(`Falha ao excluir o profissional ${professionalId}:`, error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao excluir o profissional."
    );
  }
});
// ============================================================================
// ===== FUNÇÃO: EXCLUIR CONTA DE ESTABELECIMENTO (DONO)
// ============================================================================
export const deleteOwnerAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Ação não autorizada.");
  }

  const ownerUid = request.auth.uid;
  const { establishmentId } = request.data;

  if (!establishmentId) {
    throw new HttpsError(
      "invalid-argument",
      "ID do estabelecimento é obrigatório."
    );
  }

  // Verificação de segurança crucial: O dono da conta é quem está pedindo a exclusão?
  if (ownerUid !== establishmentId) {
    throw new HttpsError(
      "permission-denied",
      "Você não tem permissão para excluir este estabelecimento."
    );
  }

  const db = admin.firestore();
  const establishmentRef = db.collection("establishments").doc(establishmentId);

  try {
    // 1. REGRA DE NEGÓCIO: Verificar se existem agendamentos futuros.
    const futureAppointmentsQuery = establishmentRef
      .collection("appointments")
      .where("dateTime", ">", admin.firestore.Timestamp.now());

    const futureAppointments = await futureAppointmentsQuery.get();
    if (!futureAppointments.empty) {
      throw new HttpsError(
        "failed-precondition", // Este erro específico pode ser tratado no frontend
        `Sua conta não pode ser excluída pois existem ${futureAppointments.size} agendamento(s) futuro(s). Por favor, conclua ou cancele todos os agendamentos antes de prosseguir.`
      );
    }

    // Se passou na verificação, começa o processo de exclusão em cascata.
    console.log(`Iniciando exclusão do estabelecimento ${establishmentId}`);

    // 2. Excluir todos os profissionais associados (e suas contas de Auth)
    const professionalsSnapshot = await establishmentRef
      .collection("professionals")
      .get();
    if (!professionalsSnapshot.empty) {
      for (const doc of professionalsSnapshot.docs) {
        const professional = doc.data();
        if (professional.authUid) {
          try {
            await admin.auth().deleteUser(professional.authUid);
          } catch (error: any) {
            if (error.code !== "auth/user-not-found") console.error(error);
          }
        }
        await doc.ref.delete(); // Deleta o documento do profissional
      }
      console.log(`${professionalsSnapshot.size} profissionais excluídos.`);
    }

    // 3. Excluir todos os serviços
    const servicesSnapshot = await establishmentRef
      .collection("services")
      .get();
    if (!servicesSnapshot.empty) {
      const batch = db.batch();
      servicesSnapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`${servicesSnapshot.size} serviços excluídos.`);
    }

    // (Opcional) Excluir subcoleções de agendamentos, se desejar.
    // A anonimização já protege os dados dos clientes.

    // 4. Excluir o documento principal do estabelecimento
    await establishmentRef.delete();
    console.log(`Documento do estabelecimento ${establishmentId} excluído.`);

    // 5. Excluir o documento de usuário do dono
    await db.collection("users").doc(ownerUid).delete();
    console.log(`Documento do usuário (dono) ${ownerUid} excluído.`);

    // 6. Excluir a conta de autenticação do dono (passo final)
    await admin.auth().deleteUser(ownerUid);
    console.log(`Conta de autenticação do dono ${ownerUid} excluída.`);

    return { success: true };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error(
      `Falha ao excluir o estabelecimento ${establishmentId}:`,
      error
    );
    throw new HttpsError(
      "internal",
      "Ocorreu um erro interno ao excluir o estabelecimento."
    );
  }
});
// ============================================================================
// ===== FUNÇÃO: VERIFICAR AGENDAMENTOS FUTUROS DE UM ESTABELECIMENTO
// ============================================================================
export const checkFutureAppointments = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Ação não autorizada.");
  }

  const uid = request.auth.uid;
  const establishmentId = request.data.establishmentId;

  // Verificação de segurança: O solicitante é o dono do estabelecimento?
  if (uid !== establishmentId) {
    throw new HttpsError(
      "permission-denied",
      "Você não tem permissão para esta ação."
    );
  }

  const db = admin.firestore();
  const futureAppointmentsQuery = db
    .collection("establishments")
    .doc(establishmentId)
    .collection("appointments")
    .where("dateTime", ">", admin.firestore.Timestamp.now());

  // Usar .count() para uma consulta otimizada
  const countSnapshot = await futureAppointmentsQuery.count().get();

  return { futureAppointmentsCount: countSnapshot.data().count };
});
