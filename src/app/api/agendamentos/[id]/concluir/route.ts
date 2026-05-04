import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const { formaPagamento } = await req.json();

  const ag = await prisma.agendamento.findFirst({ where: { id, userId } });
  if (!ag) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (ag.status === "concluido") return NextResponse.json({ error: "Já concluído" }, { status: 400 });

  const [updated] = await prisma.$transaction([
    prisma.agendamento.update({
      where: { id },
      data: { status: "concluido" },
    }),
    prisma.financeiro.create({
      data: {
        userId,
        agendamentoId: id,
        tipo: "entrada",
        categoria: "procedimento",
        descricao: ag.servico,
        valor: ag.valor,
        formaPagamento: formaPagamento || null,
        clienteNome: ag.clienteNome,
        servico: ag.servico,
        data: new Date(),
      },
    }),
  ]);

  return NextResponse.json(updated);
}
