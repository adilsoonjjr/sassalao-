import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const { formaPagamento, servico, valor } = await req.json();

  const ag = await prisma.agendamento.findFirst({ where: { id, userId } });
  if (!ag) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (ag.status === "concluido") return NextResponse.json({ error: "Já concluído" }, { status: 400 });

  const servicoFinal = servico?.trim() || ag.servico;
  const valorFinal = typeof valor === "number" && valor > 0 ? valor : ag.valor;

  const [updated] = await prisma.$transaction([
    prisma.agendamento.update({
      where: { id },
      data: { status: "concluido", servico: servicoFinal, valor: valorFinal },
    }),
    prisma.financeiro.create({
      data: {
        userId,
        agendamentoId: id,
        tipo: "entrada",
        categoria: "procedimento",
        descricao: servicoFinal,
        valor: valorFinal,
        formaPagamento: formaPagamento || null,
        clienteNome: ag.clienteNome,
        servico: servicoFinal,
        data: new Date(),
      },
    }),
  ]);

  return NextResponse.json(updated);
}
