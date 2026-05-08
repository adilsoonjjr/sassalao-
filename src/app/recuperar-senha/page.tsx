"use client";
import { useState } from "react";
import Link from "next/link";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { setError("Erro ao enviar e-mail. Tente novamente."); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary-dark)" }}>Sassalão</h1>
        </div>

        <div className="rounded-2xl shadow-sm p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-lg font-semibold mb-2">E-mail enviado!</h2>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                Se esse e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a caixa de spam.
              </p>
              <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                ← Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">Recuperar senha</h2>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                Informe seu e-mail e enviaremos as instruções para redefinir a senha.
              </p>
              {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee2e2", color: "var(--danger)" }}>{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: "var(--primary)", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Enviando..." : "Enviar instruções"}
                </button>
              </form>
              <p className="text-center text-sm mt-5">
                <Link href="/login" className="hover:underline" style={{ color: "var(--muted)" }}>
                  ← Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
