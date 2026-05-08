import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

// Endpoint temporário para criar usuário de teste — remover após uso
export async function GET() {
  const email = "adil@teste.com";
  const password = "Minhasenha123";
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbPrefix = dbUrl.slice(0, 25);

  // Build a fresh client inline (bypasses module-level cache)
  let db: PrismaClient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeonHttp(dbUrl, {} as any);
    db = new PrismaClient({ adapter } as never);
  } catch (err) {
    return NextResponse.json({ ok: false, step: "construct", error: String(err), dbPrefix }, { status: 500 });
  }

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      const hashed = await bcrypt.hash(password, 12);
      await db.user.update({
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
    await db.user.create({
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
    return NextResponse.json({ ok: false, step: "query", error: String(err), dbPrefix }, { status: 500 });
  } finally {
    await db.$disconnect().catch(() => {});
  }
}
