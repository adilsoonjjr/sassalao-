import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { plano } = await req.json(); // mensal | anual

  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  });

  const preference = new Preference(client);

  const isAnual = plano === "anual";
  const valor = isAnual ? 199 : 19.9;
  const titulo = isAnual ? "Beleza em Dia – Plano Anual" : "Beleza em Dia – Plano Mensal";

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title: titulo,
            quantity: 1,
            unit_price: valor,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: session.user.email ?? "",
          name: session.user.name ?? "",
        },
        external_reference: `${session.user.id}|${plano}`,
        payment_methods: {
          installments: 12,
        },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/planos/sucesso`,
          failure: `${process.env.NEXTAUTH_URL}/planos`,
          pending: `${process.env.NEXTAUTH_URL}/planos/pendente`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (err) {
    console.error("MercadoPago checkout error:", err);
    return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 });
  }
}
