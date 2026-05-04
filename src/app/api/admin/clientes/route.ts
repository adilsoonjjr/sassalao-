import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const clientes = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      planStatus: true,
      trialEndsAt: true,
      planEndsAt: true,
      createdAt: true,
      _count: { select: { agendamentos: true } },
    },
  });

  const agora = new Date();
  const resultado = clientes.map((c) => ({
    ...c,
    statusReal:
      c.planStatus === "active" && c.planEndsAt && c.planEndsAt > agora
        ? "active"
        : c.planStatus === "trial" && c.trialEndsAt > agora
        ? "trial"
        : "expired",
  }));

  const total = clientes.length;
  const ativos = resultado.filter((c) => c.statusReal === "active").length;
  const trial = resultado.filter((c) => c.statusReal === "trial").length;
  const expirados = resultado.filter((c) => c.statusReal === "expired").length;
  const mrr = ativos * 39;

  return NextResponse.json({ clientes: resultado, total, ativos, trial, expirados, mrr });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { userId, meses } = await req.json();

  const agora = new Date();
  const planEndsAt = new Date(agora.getFullYear(), agora.getMonth() + (meses || 1), agora.getDate());

  await prisma.user.update({
    where: { id: userId },
    data: { planStatus: "active", planEndsAt },
  });

  return NextResponse.json({ ok: true });
}
