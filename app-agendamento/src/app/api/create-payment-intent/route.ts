import { NextResponse, type NextRequest } from "next/server";
import admin from "firebase-admin";

interface AppointmentDetails {
  establishmentId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  professionalId: string;
  professionalName: string;
  bookingTimestamp: string;
}

interface RequestBody {
  paymentMethodId: string;
  appointmentDetails: AppointmentDetails;
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
      ),
    });
  } catch (error) {
    console.error("Falha ao inicializar o Firebase Admin:", error);
  }
}

export async function POST(request: NextRequest) {
  const functionUrl = process.env.PAYMENT_FUNCTION_URL;
  if (!functionUrl) {
    console.error(
      "Variável de ambiente PAYMENT_FUNCTION_URL não está definida."
    );
    return NextResponse.json(
      { success: false, error: "Erro de configuração do servidor." },
      { status: 500 }
    );
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Token de autorização ausente ou mal formatado.",
        },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    await admin.auth().verifyIdToken(token);

    const body: RequestBody = await request.json();
    const { paymentMethodId, appointmentDetails } = body;

    if (!paymentMethodId || !appointmentDetails) {
      return NextResponse.json(
        { success: false, error: "Dados da requisição inválidos." },
        { status: 400 }
      );
    }

    const payloadForFirebase = {
      amount: appointmentDetails.price * 100,
      paymentMethodId,
      appointmentDetails,
    };

    // A chamada para a Cloud Function
    const firebaseResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // --- CORREÇÃO APLICADA AQUI ---
        // Repassamos o cabeçalho de autorização para a Cloud Function
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadForFirebase),
    });

    const result = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erro na função de pagamento.",
        },
        { status: firebaseResponse.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro inesperado na API Route de pagamento:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
