import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const ano = parseInt(searchParams.get("ano") || String(new Date().getFullYear()));

  const inicio = new Date(ano, 0, 1);
  const fim = new Date(ano, 11, 31, 23, 59, 59);

  const [financeiros, gastos, agendamentos] = await Promise.all([
    prisma.financeiro.findMany({ where: { userId, data: { gte: inicio, lte: fim } } }),
    prisma.gasto.findMany({ where: { userId, data: { gte: inicio, lte: fim } } }),
    prisma.agendamento.findMany({ where: { userId, data: { gte: inicio, lte: fim } } }),
  ]);

  const mensais = Array.from({ length: 12 }, (_, i) => {
    const entradas = financeiros.filter((f) => new Date(f.data).getMonth() === i).reduce((s, f) => s + f.valor, 0);
    const saidas = gastos.filter((g) => new Date(g.data).getMonth() === i).reduce((s, g) => s + g.valor, 0);
    const atendimentos = agendamentos.filter((a) => new Date(a.data).getMonth() === i && a.status === "concluido").length;
    return { mes: i + 1, entradas, saidas, lucro: entradas - saidas, atendimentos };
  });

  const pagamentos: Record<string, number> = {};
  financeiros.forEach((f) => {
    const k = f.formaPagamento || "outros";
    pagamentos[k] = (pagamentos[k] || 0) + f.valor;
  });

  const servicos: Record<string, number> = {};
  agendamentos.filter((a) => a.status === "concluido").forEach((a) => {
    servicos[a.servico] = (servicos[a.servico] || 0) + 1;
  });
  const top5Servicos = Object.entries(servicos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const totalEntradas = financeiros.reduce((s, f) => s + f.valor, 0);
  const totalGastos = gastos.reduce((s, g) => s + g.valor, 0);
  const totalAtendimentos = agendamentos.filter((a) => a.status === "concluido").length;
  const ticketMedio = totalAtendimentos > 0 ? totalEntradas / totalAtendimentos : 0;

  return NextResponse.json({
    mensais,
    pagamentos,
    top5Servicos,
    totalEntradas,
    totalGastos,
    lucroAnual: totalEntradas - totalGastos,
    totalAtendimentos,
    ticketMedio,
  });
}
