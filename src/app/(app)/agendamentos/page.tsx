"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, statusLabel, statusColor } from "@/lib/format";

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

const STATUS_FILTERS = ["todos", "agendado", "concluido", "cancelado"];

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/agendamentos");
    const data = await res.json();
    setAgendamentos(data);
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

  const filtered = agendamentos
    .filter((a) => filtro === "todos" || a.status === filtro)
    .filter((a) =>
      !search || a.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      a.servico.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Agendamentos</h1>
        <Link
          href="/agendamentos/novo"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          + Novo
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente ou serviço..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm"
        style={{ border: "1.5px solid var(--border)", background: "var(--card)" }}
      />

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              background: filtro === s ? "var(--primary)" : "var(--card)",
              color: filtro === s ? "white" : "var(--muted)",
              border: `1px solid ${filtro === s ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            {s === "todos" ? "Todos" : statusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">Nenhum agendamento encontrado</p>
          <Link href="/agendamentos/novo" className="text-sm mt-2 block hover:underline" style={{ color: "var(--primary)" }}>
            Criar agendamento
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ag) => (
            <div
              key={ag.id}
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{ag.clienteNome}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{ag.servico}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: statusColor(ag.status) + "22", color: statusColor(ag.status) }}
                >
                  {statusLabel(ag.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <span>📅 {formatDate(ag.data)}</span>
                <span>🕐 {ag.horario}</span>
                <span className="font-semibold" style={{ color: "var(--success)" }}>{formatCurrency(ag.valor)}</span>
              </div>

              {ag.clienteTel && (
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>📞 {ag.clienteTel}</p>
              )}
              {ag.observacoes && (
                <p className="text-xs mb-3 italic" style={{ color: "var(--muted)" }}>💬 {ag.observacoes}</p>
              )}

              {ag.status === "agendado" && (
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <Link
                    href={`/agendamentos/${ag.id}/concluir`}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white transition-opacity hover:opacity-80 active:opacity-70"
                    style={{ background: "var(--success)" }}
                    title="Marcar como concluído"
                  >
                    ✓ Concluído
                  </Link>
                  {ag.clienteTel && (
                    <a
                      href={`https://wa.me/55${ag.clienteTel.replace(/\D/g,"")}?text=${encodeURIComponent(`Olá ${ag.clienteNome}! 👋\nLembrando seu agendamento:\n✂️ *${ag.servico}*\n📅 *${formatDate(ag.data)}* às *${ag.horario}*\nAté logo!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-80 active:opacity-70"
                      style={{ background: "#25D366" }}
                      title="Enviar lembrete pelo WhatsApp"
                    >
                      📲
                    </a>
                  )}
                  <Link
                    href={`/agendamentos/${ag.id}/editar`}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-center transition-opacity hover:opacity-80 active:opacity-70"
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
          ))}
        </div>
      )}
    </div>
  );
}
