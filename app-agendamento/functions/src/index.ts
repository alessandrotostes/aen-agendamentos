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

// Opções globais agora apenas definem a região.
setGlobalOptions({
  region: "southamerica-east1",
});

// A inicialização do Stripe agora acontece dentro de cada função para evitar erros de deploy.

// ===== FUNÇÃO 1: PROCESSAR PAGAMENTO COM SPLIT (onRequest) =====
export const createpaymentintent = onRequest(
  { secrets: [stripeSecretKey] },
  async (request, response) => {
    cors(request, response, async () => {
      try {
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
          // <-- SINTAXE CORRIGIDA
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

    const stripe = new Stripe(stripeSecretKey.value());
    const uid = request.auth.uid;
    const email = request.auth.token.email;

    const userDocRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists || userDoc.data()?.role !== "owner") {
      // <-- SINTAXE CORRIGIDA
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
      // <-- SINTAXE CORRIGIDA
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
      // <-- SINTAXE CORRIGIDA
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

// ===== FUNÇÃO 5: CANCELAR E REEMBOLSAR AGENDAMENTO (onCall) =====
export const cancelAndRefundAppointment = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const uid = request.auth.uid;
    const { appointmentId } = request.data;

    if (typeof appointmentId !== "string" || !appointmentId) {
      throw new HttpsError(
        "invalid-argument",
        "O ID do agendamento é obrigatório."
      );
    }

    try {
      const appointmentRef = admin
        .firestore()
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

      // --- INÍCIO DA CORREÇÃO ---

      // 1. Obter os detalhes do Payment Intent original do Stripe
      // Precisamos disto para saber o valor total e a taxa de aplicação cobrada.
      console.log(`A obter detalhes do Payment Intent: ${paymentIntentId}`);
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      // 2. Calcular o valor do reembolso (valor total - taxa do app)
      // Garantimos que o valor a reembolsar desconta a nossa taxa.
      const applicationFeeAmount = paymentIntent.application_fee_amount || 0;
      const amountToRefund = paymentIntent.amount - applicationFeeAmount;

      console.log(
        `A processar reembolso para ${paymentIntentId}. Valor total: ${paymentIntent.amount}, Taxa: ${applicationFeeAmount}, Valor a reembolsar: ${amountToRefund}`
      );

      if (amountToRefund <= 0) {
        console.log(
          "Valor do reembolso é zero ou negativo. Apenas a cancelar agendamento."
        );
        // Se não houver nada a reembolsar, apenas atualizamos o status.
      } else {
        // 3. Criar o reembolso com o valor parcial calculado
        // Ao especificar o 'amount', dizemos ao Stripe exatamente quanto devolver ao cliente.
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amountToRefund,
        });
        console.log(
          `Reembolso de ${amountToRefund} para ${paymentIntentId} processado com sucesso.`
        );
      }

      // --- FIM DA CORREÇÃO ---

      await appointmentRef.update({ status: "cancelado" });

      return {
        success: true,
        message: "Agendamento cancelado e reembolso processado com sucesso.",
      };
    } catch (error: any) {
      console.error("Erro ao cancelar e reembolsar agendamento:", error);
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
export const inviteProfessional = onCall(
  { secrets: [stripeSecretKey] }, // Podemos manter os secrets se precisar de alguma info no futuro
  async (request) => {
    // 1. Validação de Segurança: Apenas 'owners' podem convidar
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

    // 2. Verificar se já não foi convidado (se já tem um authUid)
    if (professionalData?.authUid) {
      throw new HttpsError(
        "already-exists",
        "Este profissional já foi convidado e tem uma conta de utilizador."
      );
    }

    try {
      // 3. Criar o utilizador no Firebase Authentication
      console.log(`A criar utilizador de autenticação para ${email}...`);
      const userRecord = await admin.auth().createUser({
        email: email,
        displayName: professionalData?.name,
        // Podemos definir uma senha aleatória inicial que será trocada
        password: Math.random().toString(36).slice(-8),
      });
      console.log("Utilizador criado com sucesso:", userRecord.uid);

      // 4. Associar o novo ID de autenticação ao documento do profissional
      await professionalRef.update({
        authUid: userRecord.uid,
      });

      // 5. Gerar um link para o profissional definir a sua senha
      // O Firebase enviará um email padrão para ele.
      const passwordResetLink = await admin
        .auth()
        .generatePasswordResetLink(email);

      console.log(
        `Utilizador ${userRecord.uid} associado ao profissional ${professionalId}. O profissional pode usar o link de redefinição de senha para o primeiro login.`
      );

      // Embora o Firebase envie o email, ter o link pode ser útil para debug
      return {
        success: true,
        message: "Convite enviado com sucesso!",
        link: passwordResetLink,
      };
    } catch (error: any) {
      console.error("Erro ao criar utilizador para profissional:", error);
      if (error.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "Este email já está a ser utilizado por outra conta na plataforma."
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
// Esta função irá executar automaticamente sempre que um documento na coleção 'users'
// for criado ou atualizado.
export const onUserRoleChange = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    // Se o documento foi apagado, não fazemos nada.
    if (!event.data?.after.exists) {
      return null;
    }

    // Obtemos o novo 'role' do documento.
    const newRole = event.data.after.data()?.role;
    // Obtemos o 'role' antigo, se existia.
    const oldRole = event.data.before.data()?.role;

    // Se o 'role' não mudou, não precisamos de fazer nada.
    if (newRole === oldRole) {
      console.log(`Role for user ${event.params.userId} has not changed.`);
      return null;
    }

    try {
      const userId = event.params.userId;
      console.log(
        `Role changed for user ${userId} to '${newRole}'. Setting custom claim...`
      );

      // Usamos o Firebase Admin SDK para "carimbar" o cargo no token do utilizador.
      // Se o cargo for removido (ex: newRole é undefined), as claims são limpas.
      await admin.auth().setCustomUserClaims(userId, { role: newRole });

      console.log(`Custom claim for user ${userId} successfully set.`);
      return { success: true };
    } catch (error) {
      console.error("Error setting custom user claims:", error);
      return { success: false, error: error };
    }
  }
);
