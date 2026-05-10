import AgendamentoForm from "@/components/AgendamentoForm";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteNome?: string; clienteTel?: string }>;
}) {
  const { clienteNome, clienteTel } = await searchParams;

  return (
    <AgendamentoForm
      title="Novo Agendamento"
      initialData={{
        clienteNome: clienteNome ?? "",
        clienteTel: clienteTel ?? "",
      }}
    />
  );
}
