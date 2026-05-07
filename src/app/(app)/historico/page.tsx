"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate, statusLabel, statusColor, pagamentoLabel } from "@/lib/format";

interface Agendamento {
  id: string;
  clienteNome: string;
  servico: string;
  valor: number;
  data: string;
  horario: string;
  status: string;
  observacoes: string | null;
}

type FiltroStatus = "todos" | "agendado" | "concluido" | "cancelado";

export default function HistoricoPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [search, setSearch] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    fetch("/api/agendamentos")
      .then((r) => r.json())
      .then(setAgendamentos)
      .finally(() => setLoading(false));
  }, []);

  const filtered = agendamentos.filter((a) => {
    if (filtroStatus !== "todos" && a.status !== filtroStatus) return false;
    if (search && !a.clienteNome.toLowerCase().includes(search.toLowerCase()) && !a.servico.toLowerCase().includes(search.toLowerCase())) return false;
    if (dataInicio && new Date(a.data) < new Date(dataInicio)) return false;
    if (dataFim && new Date(a.data) > new Date(dataFim + "T23:59:59")) return false;
    return true;
  });

  const totalFaturado = filtered
    .filter((a) => a.status === "concluido")
    .reduce((s, a) => s + a.valor, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold">Histórico</h1>

      {/* Filtros */}
      <div className="rounded-2xl p-4 space-y-3 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <input
          type="text"
          placeholder="Buscar cliente ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>De</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Até</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["todos", "agendado", "concluido", "cancelado"] as FiltroStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
              style={{
                background: filtroStatus === s ? "var(--primary)" : "var(--background)",
                color: filtroStatus === s ? "white" : "var(--muted)",
                border: `1px solid ${filtroStatus === s ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              {s === "todos" ? "Todos" : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm" style={{ color: "var(--muted)" }}>{filtered.length} registro(s)</span>
        <span className="text-sm font-semibold" style={{ color: "var(--success)" }}>
          Faturado: {formatCurrency(totalFaturado)}
        </span>
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-3xl mb-3">🗂️</div>
          <p>Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl shadow-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{a.clienteNome}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{a.servico}</p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: statusColor(a.status) + "22", color: statusColor(a.status) }}
                  >
                    {statusLabel(a.status)}
                  </span>
                  <p className="text-sm font-bold mt-1" style={{ color: "var(--success)" }}>{formatCurrency(a.valor)}</p>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                📅 {formatDate(a.data)} às {a.horario}
              </p>
              {a.observacoes && (
                <p className="text-xs mt-1 italic" style={{ color: "var(--muted)" }}>💬 {a.observacoes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
