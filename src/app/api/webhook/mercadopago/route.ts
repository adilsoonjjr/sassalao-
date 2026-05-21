import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifyMPSignature(req: Request, resourceId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) throw new Error("MERCADOPAGO_WEBHOOK_SECRET não configurado");

  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";

  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const idx = part.indexOf("=");
    if (idx > 0) parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const message = `id:${resourceId};request-id:${xRequestId};ts:${ts}`;
  const expected = crypto.createHmac("sha256", secret).update(message).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  const topic = body.type || body.topic;
  const resourceId = body.data?.id || body.id;

  if (topic !== "payment" || !resourceId) {
    return NextResponse.json({ ok: true });
  }

  if (!verifyMPSignature(req, String(resourceId))) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
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

    const ref = paymentData.external_reference || "";
    const [userId, plano, refHmac] = ref.split("|");
    if (!userId || !plano || !refHmac) return NextResponse.json({ ok: true });

    const expectedHmac = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "")
      .update(`${userId}:${plano}`)
      .digest("hex");
    try {
      if (!crypto.timingSafeEqual(Buffer.from(expectedHmac, "hex"), Buffer.from(refHmac, "hex"))) {
        return NextResponse.json({ ok: true });
      }
    } catch {
      return NextResponse.json({ ok: true });
    }

    const paymentIdStr = String(paymentData.id);
    const jaProcessado = await prisma.processedPayment.findUnique({
      where: { paymentId: paymentIdStr },
    });
    if (jaProcessado) return NextResponse.json({ ok: true });

    const agora = new Date();
    const planEndsAt = plano === "anual"
      ? new Date(agora.getFullYear() + 1, agora.getMonth(), agora.getDate())
      : new Date(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());

    await prisma.$transaction([
      prisma.processedPayment.create({ data: { paymentId: paymentIdStr } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          planStatus: "active",
          planEndsAt,
          mpPayerId: String(paymentData.payer?.id || ""),
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
