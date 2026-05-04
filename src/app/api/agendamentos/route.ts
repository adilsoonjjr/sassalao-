import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const agendamentos = await prisma.agendamento.findMany({
    where: { userId },
    orderBy: [{ data: "desc" }, { horario: "asc" }],
  });

  return NextResponse.json(agendamentos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const { clienteNome, clienteTel, servico, valor, data, horario, observacoes } = body;

  if (!clienteNome || !servico || !valor || !data || !horario) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      userId,
      clienteNome,
      clienteTel: clienteTel || "",
      servico,
      valor: parseFloat(valor),
      data: new Date(data),
      horario,
      observacoes: observacoes || null,
      status: "agendado",
    },
  });

  return NextResponse.json(agendamento, { status: 201 });
}
