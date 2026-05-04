import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import AgendamentoForm from "@/components/AgendamentoForm";

export default async function EditarAgendamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ag = await prisma.agendamento.findFirst({ where: { id, userId: session.user.id } });
  if (!ag) notFound();

  const dataStr = ag.data.toISOString().split("T")[0];

  return (
    <AgendamentoForm
      title="Editar Agendamento"
      agendamentoId={id}
      initialData={{
        clienteNome: ag.clienteNome,
        clienteTel: ag.clienteTel,
        servico: ag.servico,
        valor: String(ag.valor),
        data: dataStr,
        horario: ag.horario,
        observacoes: ag.observacoes ?? "",
      }}
    />
  );
}
