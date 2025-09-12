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
import * as logger from "firebase-functions/logger";

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
  // LOG 1: Início da execução e verificação de autenticação
  logger.info("Iniciando createMercadoPagoPreference...", {
    auth: request.auth,
  });

  if (!request.auth) {
    logger.error("Falha na autenticação: request.auth está vazio.");
    throw new HttpsError(
      "unauthenticated",
      "Você precisa estar logado para pagar."
    );
  }
  const clientId = request.auth.uid;

  const { transaction_amount, appointmentDetails } = request.data;
  if (!transaction_amount || !appointmentDetails) {
    logger.error("Argumentos inválidos.", { data: request.data });
    throw new HttpsError(
      "invalid-argument",
      "Detalhes do agendamento e valor são obrigatórios."
    );
  }

  let clientData;
  try {
    const clientDocRef = db.collection("users").doc(clientId);
    const clientDoc = await clientDocRef.get();

    if (!clientDoc.exists) {
      logger.error(
        `Documento do cliente não encontrado no Firestore para o UID: ${clientId}`
      );
      throw new HttpsError(
        "not-found",
        "Os dados do cliente não foram encontrados."
      );
    }
    clientData = clientDoc.data();

    // LOG 2: DADOS DO CLIENTE LIDOS DO FIRESTORE
    // Este é o log mais importante. Ele mostra o que o servidor REALMENTE leu do banco de dados.
    logger.info(`Dados do cliente lidos do Firestore para o UID: ${clientId}`, {
      clientData,
    });

    if (!clientData?.firstName || !clientData?.lastName || !clientData?.email) {
      logger.error("Dados do perfil do cliente estão incompletos.", {
        clientData,
      });
      throw new HttpsError(
        "failed-precondition",
        "Os dados do perfil do cliente estão incompletos."
      );
    }
  } catch (error) {
    logger.error(
      "Erro CRÍTICO ao buscar dados do cliente no Firestore:",
      error
    );
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "internal",
      "Não foi possível carregar os dados do cliente."
    );
  }

  // Lógica de verificação de disponibilidade do horário
  try {
    const { establishmentId, professionalId, bookingTimestamp } =
      appointmentDetails;
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
  const establishmentData = establishmentDoc.data();
  const ownerAccessToken = establishmentData?.mpCredentials?.mp_access_token;
  if (!ownerAccessToken) {
    throw new HttpsError(
      "failed-precondition",
      "Este estabelecimento não está conectado para receber pagamentos."
    );
  }

  const client = new MercadoPagoConfig({ accessToken: ownerAccessToken });
  const preference = new Preference(client);
  const application_fee = Math.floor(transaction_amount * 0.0499 * 100) / 100;

  try {
    const appointmentsRef = db
      .collection("establishments")
      .doc(appointmentDetails.establishmentId)
      .collection("appointments");
    const newAppointmentRef = appointmentsRef.doc();
    const appointmentId = newAppointmentRef.id;

    const professionalDoc = await db
      .collection("establishments")
      .doc(appointmentDetails.establishmentId)
      .collection("professionals")
      .doc(appointmentDetails.professionalId)
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
          category_id: "services",
        },
      ],
      // 4. USAR OS DADOS SEGUROS QUE BUSCAMOS DO FIRESTORE
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
      marketplace_fee: application_fee,
      statement_descriptor: statementDescriptor,
      metadata: {
        appointmentId: appointmentId,
        establishmentId: appointmentDetails.establishmentId,
      },
      external_reference: appointmentId,
      notification_url:
        "https://southamerica-east1-aen-agendamentos-produca-f8e06.cloudfunctions.net/mercadoPagoWebhook",
    };

    const preferenceResponse = await preference.create({
      body: preferenceBody,
    });
    logger.info("Objeto de preferência a ser enviado para o Mercado Pago:", {
      payer: preferenceBody.payer,
    });
    // 5. SALVAR O AGENDAMENTO COM OS DADOS CORRETOS E SEGUROS
    const finalBookingDate = new Date(appointmentDetails.bookingTimestamp);
    await newAppointmentRef.set({
      ...appointmentDetails,
      dateTime: Timestamp.fromDate(finalBookingDate),
      clientId: clientId, // O UID do usuário autenticado
      clientFirstName: clientData.firstName, // O nome vindo do banco de dados
      clientLastName: clientData.lastName, // O sobrenome vindo do banco de dados
      clientPhone: clientData.phone || "", // O telemóvel vindo do banco de dados
      professionalAuthUid,
      status: "pending_payment",
      preferenceId: preferenceResponse.id,
      createdAt: Timestamp.now(),
    });

    const initPoint = preferenceResponse.init_point;
    return { success: true, init_point: initPoint };
  } catch (error: any) {
    console.error(
      "ERRO DETALHADO AO CRIAR PREFERÊNCIA:",
      JSON.stringify(error, null, 2)
    );
    throw new HttpsError("internal", "Erro ao iniciar o pagamento.");
  }
});

// FUNÇÃO 4: WEBHOOK DO MERCADO PAGO (VERSÃO FINAL E CORRETA)
export const mercadoPagoWebhook = onRequest(
  { secrets: [mercadoPagoAccessToken] },
  async (request, response) => {
    try {
      const topic = request.body?.type || request.query?.topic;

      if (topic === "payment") {
        const paymentId = String(request.body?.data?.id || request.query?.id);
        const payment = new Payment(
          new MercadoPagoConfig({ accessToken: mercadoPagoAccessToken.value() })
        );
        const paymentInfo = await payment.get({ id: paymentId });

        const appointmentId = paymentInfo.external_reference;
        const establishmentId = paymentInfo.metadata?.establishment_id;

        if (!appointmentId || !establishmentId) {
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
          response.status(200).send("OK (agendamento não encontrado)");
          return;
        }

        const appointmentData = appointmentDoc.data();
        if (appointmentData?.status !== "pending_payment") {
          response.status(200).send("OK (já processado)");
          return;
        }

        const paymentStatus = paymentInfo.status;

        if (paymentStatus === "approved") {
          // LÓGICA SIMPLIFICADA: A data já existe, só precisamos de atualizar o status.
          await appointmentRef.update({
            status: "confirmado",
            paymentId: paymentId,
          });
        } else if (
          ["rejected", "cancelled", "failed"].includes(paymentStatus as string)
        ) {
          await appointmentRef.update({
            status: "cancelado",
            cancellationReason: `Pagamento falhou com status: ${paymentStatus}`,
          });
        } else {
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
    } catch (error) {}
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
