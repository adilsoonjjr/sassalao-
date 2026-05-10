"use client";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";

const FORMAS = [
  { value: "pix", label: "💸 Pix" },
  { value: "dinheiro", label: "💵 Dinheiro" },
  { value: "credito", label: "💳 Cartão Crédito" },
  { value: "debito", label: "💳 Cartão Débito" },
  { value: "transferencia", label: "🏦 Transferência" },
];

interface Agendamento {
  id: string;
  clienteNome: string;
  servico: string;
  valor: number;
  horario: string;
}

export default function ConcluirPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [ag, setAg] = useState<Agendamento | null>(null);
  const [servico, setServico] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agendamentos")
      .then((r) => r.json())
      .then((list: Agendamento[]) => {
        const found = list.find((a) => a.id === id);
        if (found) {
          setAg(found);
          setServico(found.servico);
          setValor(String(found.valor));
        }
      });
  }, [id]);

  async function handleConcluir() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/agendamentos/${id}/concluir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formaPagamento, servico, valor: parseFloat(valor) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao concluir");
      setLoading(false);
      return;
    }

    router.push("/agendamentos");
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm";
  const inputStyle = { border: "1.5px solid var(--border)", background: "var(--background)", outline: "none" };

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xl p-1">←</button>
        <h1 className="text-xl font-bold">Concluir Procedimento</h1>
      </div>

      <div className="rounded-2xl p-5 shadow-sm space-y-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {ag && (
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Cliente: <span style={{ color: "var(--foreground)" }}>{ag.clienteNome}</span>
          </p>
        )}

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        {/* Serviço e valor editáveis para caso o cliente altere na hora */}
        <div className="space-y-3 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Serviço realizado
          </p>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Procedimento</label>
            <input
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              placeholder="Ex: Corte + escova"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Valor cobrado (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          {ag && (servico !== ag.servico || valor !== String(ag.valor)) && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
              ✏️ Alterado em relação ao agendamento original ({ag.servico} · R$ {ag.valor})
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: "var(--muted)" }}>
            Forma de pagamento
          </label>
          <div className="grid grid-cols-1 gap-2">
            {FORMAS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormaPagamento(f.value)}
                className="py-3 px-4 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: formaPagamento === f.value ? "var(--accent)" : "var(--background)",
                  border: `1.5px solid ${formaPagamento === f.value ? "var(--primary)" : "var(--border)"}`,
                  color: formaPagamento === f.value ? "var(--primary-dark)" : "var(--foreground)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
          >
            Voltar
          </button>
          <button
            onClick={handleConcluir}
            disabled={loading || !servico || !valor}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--success)", opacity: loading || !servico || !valor ? 0.6 : 1 }}
          >
            {loading ? "Confirmando..." : "✓ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
