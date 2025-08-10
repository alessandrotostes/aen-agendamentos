import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// CORREÇÃO: Usando require para importar o cors
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({ origin: true });

admin.initializeApp();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

setGlobalOptions({
  region: "southamerica-east1",
  secrets: [stripeSecretKey],
});

let stripe: Stripe;

export const createpaymentintent = onRequest(async (request, response) => {
  // Usamos o corsHandler para lidar com as requisições
  cors(request, response, async () => {
    console.log("--- Função createpaymentintent iniciada ---");

    stripe = new Stripe(stripeSecretKey.value());

    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.error("Erro: Cabeçalho de autorização ausente ou malformado.");
      response.status(401).send({ error: "Unauthorized" });
      return;
    }
    console.log("Cabeçalho de autorização encontrado.");

    const idToken = authorization.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Token verificado com sucesso para o UID:", decodedToken.uid);
    } catch (error) {
      console.error("Erro ao verificar o token de autenticação:", error);
      response.status(401).send({ error: "Unauthorized" });
      return;
    }

    console.log(
      "Corpo da requisição recebido:",
      JSON.stringify(request.body, null, 2)
    );
    const { amount, paymentMethodId } = request.body;

    if (!amount || !paymentMethodId) {
      console.error(
        "Erro: 'amount' ou 'paymentMethodId' ausentes no corpo da requisição."
      );
      response.status(400).send({ error: "Dados de pagamento inválidos." });
      return;
    }
    console.log(
      `Dados recebidos - Amount: ${amount}, PaymentMethodID: ${paymentMethodId}`
    );

    try {
      console.log("Tentando criar PaymentIntent no Stripe...");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "brl",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      console.log(
        "PaymentIntent recebido do Stripe. Status:",
        paymentIntent.status
      );
      if (paymentIntent.status === "succeeded") {
        console.log(
          "SUCESSO: Pagamento processado com sucesso:",
          paymentIntent.id
        );
        response
          .status(200)
          .send({ success: true, paymentIntentId: paymentIntent.id });
      } else {
        console.warn(
          "AVISO: Pagamento não sucedido. Status:",
          paymentIntent.status
        );
        response
          .status(400)
          .send({
            error: "O pagamento não foi bem-sucedido ou requer ação adicional.",
          });
      }
    } catch (error: any) {
      console.error("--- ERRO DO STRIPE ---", error);
      response.status(500).send({ error: error.message });
    }
  });
});
