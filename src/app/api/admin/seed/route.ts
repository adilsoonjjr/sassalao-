import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Endpoint temporário para criar usuário de teste — remover após uso
export async function GET() {
  const email = "adil@teste.com";
  const password = "Minhasenha123";

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Só atualiza senha e plano se já existir
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashed,
          planStatus: "active",
          planEndsAt: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000),
          trialEndsAt: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({ ok: true, action: "updated", email, password });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name: "Adil Teste",
        email,
        password: hashed,
        planStatus: "active",
        planEndsAt: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 999 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ ok: true, action: "created", email, password });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
