import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const [
    entradasHoje,
    entradasMes,
    agendamentosHoje,
    atendimentosMes,
    gastosFixosMes,
    gastosVariaveisMes,
  ] = await Promise.all([
    prisma.financeiro.aggregate({ where: { userId, tipo: "entrada", data: { gte: inicioHoje, lte: fimHoje } }, _sum: { valor: true } }),
    prisma.financeiro.aggregate({ where: { userId, tipo: "entrada", data: { gte: inicioMes, lte: fimMes } }, _sum: { valor: true } }),
    // Todos os agendamentos do dia (agendado + concluido), ordenados por horário
    prisma.agendamento.findMany({
      where: { userId, data: { gte: inicioHoje, lte: fimHoje } },
      orderBy: { horario: "asc" },
    }),
    prisma.agendamento.count({ where: { userId, status: "concluido", data: { gte: inicioMes, lte: fimMes } } }),
    prisma.gasto.aggregate({ where: { userId, tipo: "fixo", data: { gte: inicioMes, lte: fimMes } }, _sum: { valor: true } }),
    prisma.gasto.aggregate({ where: { userId, tipo: "pessoal", data: { gte: inicioMes, lte: fimMes } }, _sum: { valor: true } }),
  ]);

  const totalEntradasMes = entradasMes._sum.valor ?? 0;
  const totalGastosMes = (gastosFixosMes._sum.valor ?? 0) + (gastosVariaveisMes._sum.valor ?? 0);

  return NextResponse.json({
    faturadoHoje: entradasHoje._sum.valor ?? 0,
    faturadoMes: totalEntradasMes,
    agendamentosHoje,
    atendimentosMes,
    lucroLiquido: totalEntradasMes - totalGastosMes,
  });
}
