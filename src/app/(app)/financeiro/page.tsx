"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, pagamentoLabel } from "@/lib/format";

interface Financeiro {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string | null;
  clienteNome: string | null;
  data: string;
}

interface Gasto {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
}

export default function FinanceiroPage() {
  const [financeiros, setFinanceiros] = useState<Financeiro[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<"entradas" | "gastos">("entradas");

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/financeiro?mes=${mes}&ano=${ano}`);
    const data = await res.json();
    setFinanceiros(data.financeiros || []);
    setGastos(data.gastos || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [mes, ano]);

  const totalEntradas = financeiros.filter((f) => f.tipo === "entrada").reduce((s, f) => s + f.valor, 0);
  const totalGastos = gastos.reduce((s, g) => s + g.valor, 0);
  const lucro = totalEntradas - totalGastos;

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Financeiro</h1>
        <Link
          href="/financeiro/novo"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          + Registrar
        </Link>
      </div>

      {/* Seletor de mês */}
      <div className="flex items-center gap-2">
        <button onClick={() => { if (mes === 1) { setMes(12); setAno(y => y - 1); } else setMes(m => m - 1); }} className="text-xl px-2">‹</button>
        <span className="font-semibold text-sm">{meses[mes - 1]} {ano}</span>
        <button onClick={() => { if (mes === 12) { setMes(1); setAno(y => y + 1); } else setMes(m => m + 1); }} className="text-xl px-2">›</button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Entradas</p>
          <p className="font-bold text-sm" style={{ color: "var(--success)" }}>{formatCurrency(totalEntradas)}</p>
        </div>
        <div className="rounded-2xl p-4 text-center shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Gastos</p>
          <p className="font-bold text-sm" style={{ color: "var(--danger)" }}>{formatCurrency(totalGastos)}</p>
        </div>
        <div className="rounded-2xl p-4 text-center shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Lucro</p>
          <p className="font-bold text-sm" style={{ color: lucro >= 0 ? "var(--success)" : "var(--danger)" }}>{formatCurrency(lucro)}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2">
        {(["entradas", "gastos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className="px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all"
            style={{
              background: aba === a ? "var(--primary)" : "var(--card)",
              color: aba === a ? "white" : "var(--muted)",
              border: `1px solid ${aba === a ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            {a === "entradas" ? "Entradas" : "Gastos"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--muted)" }}>Carregando...</p>
      ) : aba === "entradas" ? (
        financeiros.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <div className="text-4xl mb-3">💰</div>
            <p>Nenhuma entrada neste mês</p>
          </div>
        ) : (
          <div className="space-y-2">
            {financeiros.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-xl shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="font-semibold text-sm">{f.descricao}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {f.clienteNome && `${f.clienteNome} · `}{pagamentoLabel(f.formaPagamento)} · {formatDate(f.data)}
                  </p>
                </div>
                <p className="font-bold text-sm" style={{ color: "var(--success)" }}>+{formatCurrency(f.valor)}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        gastos.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <div className="text-4xl mb-3">🧾</div>
            <p>Nenhum gasto neste mês</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gastos.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-4 rounded-xl shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="font-semibold text-sm">{g.descricao}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {g.tipo === "fixo" ? "🏠 Fixo" : "💳 Pessoal"} · {formatDate(g.data)}
                  </p>
                </div>
                <p className="font-bold text-sm" style={{ color: "var(--danger)" }}>-{formatCurrency(g.valor)}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
