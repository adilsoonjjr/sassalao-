import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  // Mercado Pago envia notificações de tipos diferentes
  const topic = body.type || body.topic;
  const resourceId = body.data?.id || body.id;

  if (topic !== "payment" || !resourceId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    });

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: resourceId });

    if (paymentData.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // external_reference = "userId|plano"
    const ref = paymentData.external_reference || "";
    const [userId, plano] = ref.split("|");
    if (!userId) return NextResponse.json({ ok: true });

    const agora = new Date();
    const planEndsAt = plano === "anual"
      ? new Date(agora.getFullYear() + 1, agora.getMonth(), agora.getDate())
      : new Date(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());

    await prisma.user.update({
      where: { id: userId },
      data: {
        planStatus: "active",
        planEndsAt,
        mpPayerId: String(paymentData.payer?.id || ""),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook MP error:", err);
    return NextResponse.json({ ok: true });
  }
}

// GET para verificação do endpoint pelo MP
export async function GET() {
  return NextResponse.json({ ok: true });
}
