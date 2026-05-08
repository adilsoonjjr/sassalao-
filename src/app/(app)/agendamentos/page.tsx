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
          <div className="text-3xl mb-3">📅</div>
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
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white transition-opacity hover:opacity-80 active:opacity-70 flex items-center justify-center gap-1"
                    style={{ background: "var(--success)" }}
                    title="Marcar como concluído"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Concluído
                  </Link>
                  {ag.clienteTel && (
                    <a
                      href={`https://wa.me/55${ag.clienteTel.replace(/\D/g,"")}?text=${encodeURIComponent(`Olá ${ag.clienteNome}! 👋\nLembrando seu agendamento:\n✂️ *${ag.servico}*\n📅 *${formatDate(ag.data)}* às *${ag.horario}*\nAté logo!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 active:opacity-70"
                      style={{ background: "#25D366" }}
                      title="Enviar lembrete pelo WhatsApp"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  )}
                  <Link
                    href={`/agendamentos/${ag.id}/editar`}
                    className="py-2 px-3 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 active:opacity-70"
                    style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
                    title="Editar agendamento"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </Link>
                  <button
                    onClick={() => cancelar(ag.id)}
                    className="py-2 px-3 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 active:opacity-70"
                    style={{ background: "#fee2e2", color: "var(--danger)" }}
                    title="Cancelar agendamento"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
