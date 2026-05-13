import { NextResponse } from "next/server";
import webpush from "web-push";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
  });

  if (subs.length === 0) {
    return NextResponse.json({ error: "Nenhuma assinatura encontrada. Abra o app e aceite as notificações." }, { status: 404 });
  }

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: "Beleza em Dia – Teste ✅",
          body: "Notificações funcionando! Você receberá lembretes 30 min antes.",
          url: "/agendamentos",
          whatsappUrl: null,
        })
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: subs.length });
}
