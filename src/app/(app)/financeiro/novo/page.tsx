"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIAS_ENTRADA = [
  { value: "outra_receita", label: "Outra receita" },
];

const CATEGORIAS_SAIDA = [
  { value: "gasto_fixo", label: "🏠 Gasto fixo (aluguel, energia, água...)" },
  { value: "gasto_pessoal", label: "💳 Gasto pessoal / variável" },
];

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "💸 Pix" },
  { value: "dinheiro", label: "💵 Dinheiro" },
  { value: "credito", label: "💳 Cartão Crédito" },
  { value: "debito", label: "💳 Cartão Débito" },
  { value: "transferencia", label: "🏦 Transferência" },
];

export default function NovoRegistroPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"entrada" | "saida">("saida");
  const [form, setForm] = useState({
    categoria: "gasto_fixo",
    descricao: "",
    valor: "",
    formaPagamento: "",
    clienteNome: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, ...form }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar");
      setLoading(false);
      return;
    }

    router.push("/financeiro");
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm";
  const inputStyle = { border: "1.5px solid var(--border)", background: "var(--background)" };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: "var(--muted)" };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xl p-1">←</button>
        <h1 className="text-xl font-bold">Registrar</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setTipo("saida"); setForm(f => ({ ...f, categoria: "gasto_fixo" })); }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tipo === "saida" ? "var(--danger)" : "var(--card)",
            color: tipo === "saida" ? "white" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          ↓ Gasto / Saída
        </button>
        <button
          onClick={() => { setTipo("entrada"); setForm(f => ({ ...f, categoria: "outra_receita" })); }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tipo === "entrada" ? "var(--success)" : "var(--card)",
            color: tipo === "entrada" ? "white" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          ↑ Entrada
        </button>
      </div>

      <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={onChange} className={inputClass} style={inputStyle}>
              {(tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Descrição *</label>
            <input name="descricao" value={form.descricao} onChange={onChange} placeholder="Ex: Aluguel do salão" required className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Valor (R$) *</label>
            <input name="valor" value={form.valor} onChange={onChange} type="number" step="0.01" min="0" placeholder="0,00" required className={inputClass} style={inputStyle} />
          </div>

          {tipo === "entrada" && (
            <>
              <div>
                <label className={labelClass} style={labelStyle}>Cliente (opcional)</label>
                <input name="clienteNome" value={form.clienteNome} onChange={onChange} placeholder="Nome do cliente" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Forma de pagamento</label>
                <select name="formaPagamento" value={form.formaPagamento} onChange={onChange} className={inputClass} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelClass} style={labelStyle}>Data</label>
            <input name="data" value={form.data} onChange={onChange} type="date" className={inputClass} style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: tipo === "saida" ? "var(--danger)" : "var(--success)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
