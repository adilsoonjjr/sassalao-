"use client";
import { useState, useEffect } from "react";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  observacoes?: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", observacoes: "" });
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch("/api/clientes");
    if (res.ok) {
      const data = await res.json();
      setClientes(data);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const tel = form.telefone.replace(/\D/g, "");
    const body = { ...form, telefone: tel };

    try {
      const res = editando
        ? await fetch(`/api/clientes/${editando.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/clientes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Erro ao salvar. Tente novamente.");
        setLoading(false);
        return;
      }

      setForm({ nome: "", telefone: "", email: "", observacoes: "" });
      setEditando(null);
      setShowForm(false);
      await carregar();
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir cliente?")) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    carregar();
  }

  function editar(c: Cliente) {
    setEditando(c);
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email || "", observacoes: c.observacoes || "" });
    setShowForm(true);
  }

  function whatsapp(tel: string) {
    const num = tel.replace(/\D/g, "");
    window.open(`https://wa.me/55${num}`, "_blank");
  }

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Clientes</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{clientes.length} clientes cadastrados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditando(null); setForm({ nome: "", telefone: "", email: "", observacoes: "" }); }}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ background: "var(--primary)" }}
        >
          + Novo cliente
        </button>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="🔍 Buscar por nome ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm"
        style={{ border: "1.5px solid var(--border)", background: "var(--card)" }}
      />

      {/* Formulário */}
      {showForm && (
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="font-semibold mb-4">{editando ? "Editar cliente" : "Novo cliente"}</h2>
          <form onSubmit={salvar} className="space-y-3">
            {erro && (
              <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ background: "#fee2e2", color: "var(--danger)" }}>
                {erro}
              </p>
            )}
            <input
              placeholder="Nome completo *"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
            />
            <input
              placeholder="Telefone / WhatsApp *"
              value={form.telefone}
              onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              required
              type="tel"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
            />
            <input
              placeholder="E-mail (opcional)"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
            />
            <textarea
              placeholder="Observações (opcional)"
              value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-85"
                style={{ background: "var(--primary)" }}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditando(null); }}
                className="px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ background: "var(--accent)", color: "var(--muted)" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
          </div>
        )}
        {filtrados.map(c => (
          <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: "var(--primary)" }}>
              {c.nome.charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.nome}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{c.telefone}</p>
              {c.observacoes && <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{c.observacoes}</p>}
            </div>
            {/* Ações */}
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => whatsapp(c.telefone)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-opacity hover:opacity-75"
                style={{ background: "#dcfce7" }} title="WhatsApp">
                💬
              </button>
              <button onClick={() => editar(c)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-opacity hover:opacity-75"
                style={{ background: "var(--accent)" }} title="Editar">
                ✏️
              </button>
              <button onClick={() => excluir(c.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-opacity hover:opacity-75"
                style={{ background: "#fee2e2" }} title="Excluir">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
