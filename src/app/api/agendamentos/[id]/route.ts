import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.agendamento.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.agendamento.update({
    where: { id },
    data: {
      clienteNome: body.clienteNome ?? existing.clienteNome,
      clienteTel: body.clienteTel ?? existing.clienteTel,
      servico: body.servico ?? existing.servico,
      valor: body.valor !== undefined ? parseFloat(body.valor) : existing.valor,
      data: body.data ? new Date(body.data) : existing.data,
      horario: body.horario ?? existing.horario,
      observacoes: body.observacoes !== undefined ? body.observacoes : existing.observacoes,
      status: body.status ?? existing.status,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await params;
  const existing = await prisma.agendamento.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.agendamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
