import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ valida: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planStatus: true, trialEndsAt: true, planEndsAt: true },
  });

  if (!user) return NextResponse.json({ valida: false });

  const agora = new Date();

  if (user.planStatus === "active" && user.planEndsAt && user.planEndsAt > agora) {
    return NextResponse.json({ valida: true, status: "active", ate: user.planEndsAt });
  }

  if (user.planStatus === "trial" && user.trialEndsAt > agora) {
    const diasRestantes = Math.ceil((user.trialEndsAt.getTime() - agora.getTime()) / 86400000);
    return NextResponse.json({ valida: true, status: "trial", diasRestantes, ate: user.trialEndsAt });
  }

  return NextResponse.json({ valida: false, status: "expired" });
}
