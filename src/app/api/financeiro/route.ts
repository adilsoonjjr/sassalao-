import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");

  const where: { userId: string; data?: { gte: Date; lte: Date } } = { userId };

  if (mes && ano) {
    const start = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const end = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59);
    where.data = { gte: start, lte: end };
  }

  const [financeiros, gastos] = await Promise.all([
    prisma.financeiro.findMany({ where, orderBy: { data: "desc" } }),
    prisma.gasto.findMany({ where: { userId }, orderBy: { data: "desc" } }),
  ]);

  return NextResponse.json({ financeiros, gastos });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const { tipo, categoria, descricao, valor, formaPagamento, clienteNome, servico, data } = body;

  if (!tipo || !descricao || !valor) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  if (tipo === "saida") {
    const gasto = await prisma.gasto.create({
      data: {
        userId,
        tipo: categoria === "gasto_fixo" ? "fixo" : "pessoal",
        descricao,
        valor: parseFloat(valor),
        data: data ? new Date(data) : new Date(),
      },
    });
    return NextResponse.json(gasto, { status: 201 });
  }

  const financeiro = await prisma.financeiro.create({
    data: {
      userId,
      tipo,
      categoria: categoria || "outra_receita",
      descricao,
      valor: parseFloat(valor),
      formaPagamento: formaPagamento || null,
      clienteNome: clienteNome || null,
      servico: servico || null,
      data: data ? new Date(data) : new Date(),
    },
  });

  return NextResponse.json(financeiro, { status: 201 });
}
