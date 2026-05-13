"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  planStatus: string;
  statusReal: string;
  trialEndsAt: string;
  planEndsAt: string | null;
  createdAt: string;
  _count: { agendamentos: number };
}

interface Stats {
  total: number;
  ativos: number;
  trial: number;
  expirados: number;
  mrr: number;
  clientes: Cliente[];
}

const STATUS_COLOR: Record<string, string> = {
  active: "var(--success)",
  trial: "var(--warning)",
  expired: "var(--danger)",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  trial: "Trial",
  expired: "Expirado",
};

export default function AdminPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ativando, setAtivando] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/clientes");
    if (!res.ok) { alert("Acesso negado"); return; }
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function ativar(userId: string, meses: number) {
    setAtivando(userId);
    await fetch("/api/admin/clientes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, meses }),
    });
    await load();
    setAtivando(null);
  }

  const filtrados = data?.clientes.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto" style={{ background: "var(--background)" }}>
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.svg" alt="Beleza em Dia" className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold">Painel Admin – Beleza em Dia</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Gerenciamento de clientes e assinaturas</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total", value: data?.total ?? 0, icon: "👥", color: "var(--foreground)" },
              { label: "Ativos", value: data?.ativos ?? 0, icon: "✅", color: "var(--success)" },
              { label: "Trial", value: data?.trial ?? 0, icon: "⏳", color: "var(--warning)" },
              { label: "Expirados", value: data?.expirados ?? 0, icon: "❌", color: "var(--danger)" },
              { label: "MRR", value: formatCurrency(data?.mrr ?? 0), icon: "💰", color: "var(--success)" },
            ].map((k, i) => (
              <div key={i} className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{k.label}</span>
                  <span className="text-xl">{k.icon}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm mb-4"
            style={{ border: "1.5px solid var(--border)", background: "var(--card)" }}
          />

          {/* Tabela */}
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--accent)" }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>Cliente</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>E-mail</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>Status</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>Vence em</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>Agend.</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--primary-dark)" }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((c, i) => {
                    const vence = c.statusReal === "active" ? c.planEndsAt : c.trialEndsAt;
                    return (
                      <tr key={c.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)" }}>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{c.name}</p>
                          {c.phone && <p className="text-xs" style={{ color: "var(--muted)" }}>{c.phone}</p>}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--muted)" }}>{c.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: STATUS_COLOR[c.statusReal] + "22", color: STATUS_COLOR[c.statusReal] }}
                          >
                            {STATUS_LABEL[c.statusReal]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--muted)" }}>
                          {vence ? new Date(vence).toLocaleDateString("pt-BR") : "–"}
                        </td>
                        <td className="px-4 py-3 text-center">{c._count.agendamentos}</td>
                        <td className="px-4 py-3 text-center">
                          {c.statusReal !== "active" && (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => ativar(c.id, 1)}
                                disabled={ativando === c.id}
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ background: "var(--success)" }}
                              >
                                {ativando === c.id ? "..." : "+1 mês"}
                              </button>
                              <button
                                onClick={() => ativar(c.id, 12)}
                                disabled={ativando === c.id}
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ background: "var(--primary)" }}
                              >
                                {ativando === c.id ? "..." : "+1 ano"}
                              </button>
                            </div>
                          )}
                          {c.statusReal === "active" && (
                            <span className="text-xs" style={{ color: "var(--success)" }}>✓ Ativo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
