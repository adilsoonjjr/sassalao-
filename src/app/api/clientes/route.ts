import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const clientes = await prisma.cliente.findMany({
    where: { userId },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(clientes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { nome, telefone, email, observacoes } = await req.json();
  if (!nome || !telefone) return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });

  const cliente = await prisma.cliente.create({
    data: { userId, nome, telefone, email, observacoes },
  });

  return NextResponse.json(cliente, { status: 201 });
}
