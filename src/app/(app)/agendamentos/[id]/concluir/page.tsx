"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

const FORMAS = [
  { value: "pix", label: "💸 Pix" },
  { value: "dinheiro", label: "💵 Dinheiro" },
  { value: "credito", label: "💳 Cartão Crédito" },
  { value: "debito", label: "💳 Cartão Débito" },
  { value: "transferencia", label: "🏦 Transferência" },
];

export default function ConcluirPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formaPagamento, setFormaPagamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConcluir() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/agendamentos/${id}/concluir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formaPagamento }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao concluir");
      setLoading(false);
      return;
    }

    router.push("/agendamentos");
  }

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xl p-1">←</button>
        <h1 className="text-xl font-bold">Concluir Procedimento</h1>
      </div>

      <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Ao confirmar, o valor do procedimento será adicionado ao seu caixa.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div className="mb-5">
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
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--success)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Confirmando..." : "✓ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
