"use client";
import { useEffect, useState } from "react";
import { StatCard, Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, statusLabel, statusColor } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTel: string;
  servico: string;
  valor: number;
  data: string;
  horario: string;
  observacoes: string | null;
  status: string;
}

interface DashboardData {
  faturadoHoje: number;
  faturadoMes: number;
  agendamentosHoje: Agendamento[];
  atendimentosMes: number;
  lucroLiquido: number;
}

function whatsappLink(tel: string, nome: string, servico: string, horario: string) {
  const num = tel.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Olá ${nome}! 👋\nLembrando seu agendamento:\n✂️ *${servico}*\n🕐 Hoje às *${horario}*\nAté logo!`
  );
  return `https://wa.me/55${num}?text=${msg}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/dashboard");
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function cancelar(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    await fetch(`/api/agendamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    });
    load();
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });

  const pendentes = data?.agendamentosHoje.filter((a) => a.status === "agendado") ?? [];
  const concluidos = data?.agendamentosHoje.filter((a) => a.status === "concluido") ?? [];
  const cancelados = data?.agendamentosHoje.filter((a) => a.status === "cancelado") ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Olá! 👋</h1>
          <p className="text-sm capitalize mt-0.5" style={{ color: "var(--muted)" }}>{hoje}</p>
        </div>
        <Link
          href="/agendamentos/novo"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 active:opacity-70"
          style={{ background: "var(--primary)" }}
        >
          + Agendar
        </Link>
      </div>

      {/* KPIs rápidos do dia */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Faturado hoje"
          value={formatCurrency(data?.faturadoHoje ?? 0)}
          icon="💵"
          color="var(--success)"
        />
        <StatCard
          label="Agendados"
          value={String(pendentes.length)}
          icon="📅"
          color="var(--warning)"
        />
        <StatCard
          label="Concluídos"
          value={String(concluidos.length)}
          icon="✅"
          color="var(--success)"
        />
      </div>

      {/* Agenda do dia */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Agenda de Hoje</h2>
          <Link
            href="/agendamentos"
            className="text-xs font-semibold hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Ver todos →
          </Link>
        </div>

        {(data?.agendamentosHoje.length ?? 0) === 0 ? (
          <Card>
            <div className="text-center py-6">
              <div className="text-4xl mb-2">📅</div>
              <p className="font-medium">Nenhum agendamento para hoje</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Sua agenda está livre!
              </p>
              <Link
                href="/agendamentos/novo"
                className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: "var(--primary)" }}
              >
                + Criar agendamento
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.agendamentosHoje.map((ag) => (
              <div
                key={ag.id}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                {/* Linha de status colorida no topo */}
                <div className="h-1 w-full" style={{ background: statusColor(ag.status) }} />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                        style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
                      >
                        {ag.clienteNome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{ag.clienteNome}</p>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>{ag.servico}</p>
                      </div>
                    </div>

                    {/* Horário + valor */}
                    <div className="text-right">
                      <p className="text-lg font-bold">{ag.horario}</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>
                        {formatCurrency(ag.valor)}
                      </p>
                    </div>
                  </div>

                  {/* Badge de status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: statusColor(ag.status) + "22", color: statusColor(ag.status) }}
                    >
                      {statusLabel(ag.status)}
                    </span>
                    {ag.clienteTel && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        📞 {ag.clienteTel}
                      </span>
                    )}
                  </div>

                  {ag.observacoes && (
                    <p className="text-xs mb-3 italic" style={{ color: "var(--muted)" }}>
                      💬 {ag.observacoes}
                    </p>
                  )}

                  {/* Ações — só para agendamentos pendentes */}
                  {ag.status === "agendado" && (
                    <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <Link
                        href={`/agendamentos/${ag.id}/concluir`}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white transition-opacity hover:opacity-80 active:opacity-70"
                        style={{ background: "var(--success)" }}
                      >
                        ✓ Concluído
                      </Link>

                      {ag.clienteTel && (
                        <a
                          href={whatsappLink(ag.clienteTel, ag.clienteNome, ag.servico, ag.horario)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white transition-opacity hover:opacity-80 active:opacity-70"
                          style={{ background: "#25D366" }}
                          title="Enviar lembrete via WhatsApp"
                        >
                          📲 WhatsApp
                        </a>
                      )}

                      <Link
                        href={`/agendamentos/${ag.id}/editar`}
                        className="py-2 px-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 active:opacity-70"
                        style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
                        title="Editar agendamento"
                      >
                        ✏️
                      </Link>

                      <button
                        onClick={() => cancelar(ag.id)}
                        className="py-2 px-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 active:opacity-70"
                        style={{ background: "#fee", color: "var(--danger)" }}
                        title="Cancelar agendamento"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo do mês */}
      <div>
        <h2 className="font-bold mb-3">Resumo do Mês</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Faturamento"
            value={formatCurrency(data?.faturadoMes ?? 0)}
            icon="📈"
            color="var(--success)"
          />
          <StatCard
            label="Lucro líquido"
            value={formatCurrency(data?.lucroLiquido ?? 0)}
            icon={( data?.lucroLiquido ?? 0) >= 0 ? "🎉" : "⚠️"}
            color={(data?.lucroLiquido ?? 0) >= 0 ? "var(--success)" : "var(--danger)"}
          />
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/agendamentos/novo"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-semibold text-sm text-white transition-opacity hover:opacity-85 active:opacity-70"
          style={{ background: "var(--primary)" }}
        >
          <span className="text-2xl">📅</span>
          Novo Agendamento
        </Link>
        <Link
          href="/financeiro/novo"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-85 active:opacity-70"
          style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
        >
          <span className="text-2xl">💰</span>
          Registrar Gasto
        </Link>
      </div>
    </div>
  );
}
