"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  clienteNome: string;
  clienteTel: string;
  servico: string;
  valor: string;
  data: string;
  horario: string;
  observacoes: string;
}

interface Props {
  initialData?: Partial<FormData>;
  agendamentoId?: string;
  title: string;
}

function whatsappLink(tel: string, nome: string, servico: string, data: string, horario: string) {
  const num = tel.replace(/\D/g, "");
  const dataFmt = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long",
  });
  const msg = encodeURIComponent(
    `Olá ${nome}! 😊\nSeu agendamento foi confirmado:\n✂️ *${servico}*\n📅 *${dataFmt}* às *${horario}*\nQualquer dúvida é só falar. Até lá!`
  );
  return `https://wa.me/55${num}?text=${msg}`;
}

export default function AgendamentoForm({ initialData, agendamentoId, title }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    clienteNome: initialData?.clienteNome ?? "",
    clienteTel: initialData?.clienteTel ?? "",
    servico: initialData?.servico ?? "",
    valor: initialData?.valor ?? "",
    data: initialData?.data ?? "",
    horario: initialData?.horario ?? "",
    observacoes: initialData?.observacoes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [criado, setCriado] = useState<FormData | null>(null);

  const todosPreenchidos =
    form.clienteNome.trim() &&
    form.servico.trim() &&
    form.valor &&
    form.data &&
    form.horario;

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = agendamentoId ? `/api/agendamentos/${agendamentoId}` : "/api/agendamentos";
    const method = agendamentoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar");
      setLoading(false);
      return;
    }

    // Se é edição, volta direto
    if (agendamentoId) {
      router.push("/agendamentos");
      router.refresh();
      return;
    }

    // Se é novo e tem telefone, mostra confirmação com WhatsApp
    if (form.clienteTel) {
      setCriado(form);
    } else {
      router.push("/agendamentos");
    }
    setLoading(false);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2";
  const inputStyle = {
    border: "1.5px solid var(--border)",
    background: "var(--background)",
    outline: "none",
  };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: "var(--muted)" };

  // Tela de confirmação pós-cadastro
  if (criado) {
    return (
      <div className="max-w-sm mx-auto space-y-5">
        <div
          className="rounded-2xl p-6 text-center shadow-sm"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-1">Agendamento criado!</h2>
          <p className="text-sm mb-1 font-semibold">{criado.clienteNome}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {criado.servico} · {new Date(criado.data + "T12:00:00").toLocaleDateString("pt-BR")} às {criado.horario}
          </p>

          <div className="mt-6 space-y-3">
            <a
              href={whatsappLink(criado.clienteTel, criado.clienteNome, criado.servico, criado.data, criado.horario)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-85 active:opacity-70"
              style={{ background: "#25D366" }}
            >
              <span className="text-lg">📲</span>
              Notificar cliente pelo WhatsApp
            </a>

            <button
              onClick={() => router.push("/agendamentos")}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 active:opacity-70"
              style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
            >
              Pular e ver agendamentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-xl p-1 rounded-lg transition-colors hover:bg-black/5 active:bg-black/10"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Nome do cliente *</label>
            <input name="clienteNome" value={form.clienteNome} onChange={onChange} placeholder="Nome completo" required className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>
              WhatsApp do cliente
              {form.clienteTel && (
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "#e6fff0", color: "#25D366" }}>
                  ✓ notificação ativa
                </span>
              )}
            </label>
            <input name="clienteTel" value={form.clienteTel} onChange={onChange} placeholder="(11) 99999-9999" type="tel" className={inputClass} style={inputStyle} />
            {!form.clienteTel && (
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Preencha para habilitar notificação via WhatsApp
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Serviço / Procedimento *</label>
            <input name="servico" value={form.servico} onChange={onChange} placeholder="Ex: Corte + escova" required className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Valor (R$) *</label>
            <input name="valor" value={form.valor} onChange={onChange} placeholder="0,00" type="number" step="0.01" min="0" required className={inputClass} style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Data *</label>
              <input name="data" value={form.data} onChange={onChange} type="date" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Horário *</label>
              <input name="horario" value={form.horario} onChange={onChange} type="time" required className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={onChange} placeholder="Anotações sobre o atendimento..." rows={3} className={`${inputClass} resize-none`} style={inputStyle} />
          </div>

          {/* Indicador de WhatsApp quando tudo preenchido */}
          {todosPreenchidos && form.clienteTel && !agendamentoId && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: "#e6fff0", border: "1px solid #b3f0c8", color: "#1a7a3e" }}
            >
              <span className="text-lg">📲</span>
              <span>Ao salvar, você poderá notificar o cliente pelo WhatsApp</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 active:opacity-70"
              style={{ background: "var(--accent)", color: "var(--primary-dark)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 active:opacity-70 disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Salvando..." : agendamentoId ? "Salvar alterações" : "Criar agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
