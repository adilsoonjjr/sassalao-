import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: Request) {
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  return (
    querySecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  // Horário atual no Brasil (UTC-3)
  const nowUTC = Date.now();
  const nowBR = new Date(nowUTC - 3 * 60 * 60 * 1000);

  // Alvo: 30 min a partir de agora (horário BR)
  const target = new Date(nowBR.getTime() + 30 * 60 * 1000);
  const targetH = String(target.getUTCHours()).padStart(2, "0");
  const targetM = String(target.getUTCMinutes()).padStart(2, "0");
  const targetHorario = `${targetH}:${targetM}`;

  // Data BR do alvo para filtrar no banco
  const targetDate = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  );
  const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      status: "agendado",
      horario: targetHorario,
      data: { gte: targetDate, lt: nextDate },
    },
    include: {
      user: {
        select: { pushSubscriptions: true },
      },
    },
  });

  const results = await Promise.allSettled(
    agendamentos.flatMap((ag) =>
      ag.user.pushSubscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: "Beleza em Dia – Lembrete ⏰",
            body: `${ag.clienteNome} às ${ag.horario} — ${ag.servico}`,
            url: "/agendamentos",
            whatsappUrl: ag.clienteTel
              ? `https://wa.me/55${ag.clienteTel.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clienteNome}! 😊\nLembrando seu agendamento daqui a 30 minutos:\n✂️ *${ag.servico}*\n⏰ às *${ag.horario}*\nTe esperamos! 🙏`)}`
              : null,
          })
        ).catch(async (err: { statusCode?: number }) => {
          // Remove assinaturas inválidas/expiradas
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          }
        })
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: agendamentos.length });
}

// Vercel Cron chama via GET
export async function GET(req: Request) {
  return POST(req);
}
