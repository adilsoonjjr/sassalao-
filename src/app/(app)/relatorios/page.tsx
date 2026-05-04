"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface RelatorioData {
  mensais: Array<{ mes: number; entradas: number; saidas: number; lucro: number; atendimentos: number }>;
  pagamentos: Record<string, number>;
  top5Servicos: Array<{ name: string; count: number }>;
  totalEntradas: number;
  totalGastos: number;
  lucroAnual: number;
  totalAtendimentos: number;
  ticketMedio: number;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PAGAMENTO_LABEL: Record<string, string> = {
  pix: "Pix", dinheiro: "Dinheiro", credito: "Crédito", debito: "Débito", transferencia: "Transferência", outros: "Outros"
};
const COLORS = ["#c084a0", "#f0a030", "#4caf7d", "#60a5fa", "#f472b6", "#a78bfa"];

export default function RelatoriosPage() {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/relatorios?ano=${ano}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [ano]);

  const pieData = data
    ? Object.entries(data.pagamentos).map(([k, v]) => ({ name: PAGAMENTO_LABEL[k] || k, value: v }))
    : [];

  const barData = data?.mensais.map((m) => ({
    name: MESES[m.mes - 1],
    Entradas: m.entradas,
    Gastos: m.saidas,
    Lucro: m.lucro,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setAno((y) => y - 1)} className="text-xl px-2">‹</button>
          <span className="font-semibold">{ano}</span>
          <button onClick={() => setAno((y) => y + 1)} className="text-xl px-2">›</button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12" style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Faturamento", value: formatCurrency(data?.totalEntradas ?? 0), color: "var(--success)", icon: "📈" },
              { label: "Gastos", value: formatCurrency(data?.totalGastos ?? 0), color: "var(--danger)", icon: "📉" },
              { label: "Lucro Anual", value: formatCurrency(data?.lucroAnual ?? 0), color: (data?.lucroAnual ?? 0) >= 0 ? "var(--success)" : "var(--danger)", icon: "💎" },
              { label: "Ticket Médio", value: formatCurrency(data?.ticketMedio ?? 0), color: "var(--primary)", icon: "🎯" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{k.label}</span>
                  <span className="text-xl">{k.icon}</span>
                </div>
                <p className="font-bold text-lg" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico de barras mensal */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 className="font-semibold mb-4 text-sm">Faturamento × Gastos por Mês</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ec" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="Entradas" fill="#4caf7d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#e05c6e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Formas de pagamento */}
            {pieData.length > 0 && (
              <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <h2 className="font-semibold mb-4 text-sm">Formas de Pagamento</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top serviços */}
            {(data?.top5Servicos?.length ?? 0) > 0 && (
              <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <h2 className="font-semibold mb-4 text-sm">Serviços Mais Realizados</h2>
                <div className="space-y-3">
                  {data?.top5Servicos.map((s, i) => {
                    const max = data.top5Servicos[0].count;
                    const pct = (s.count / max) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium truncate max-w-[180px]">{s.name}</span>
                          <span style={{ color: "var(--muted)" }}>{s.count}x</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--primary)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Atendimentos mensais */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 className="font-semibold mb-4 text-sm">Atendimentos por Mês</h2>
            <div className="flex items-end justify-between gap-1 h-24">
              {data?.mensais.map((m) => {
                const max = Math.max(...(data?.mensais.map((x) => x.atendimentos) ?? [1]), 1);
                const h = max > 0 ? (m.atendimentos / max) * 100 : 0;
                return (
                  <div key={m.mes} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold" style={{ color: "var(--primary-dark)" }}>{m.atendimentos > 0 ? m.atendimentos : ""}</span>
                    <div className="w-full rounded-t-lg" style={{ height: `${Math.max(h, 4)}%`, background: m.atendimentos > 0 ? "var(--primary)" : "var(--border)", minHeight: 4 }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{MESES[m.mes - 1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
