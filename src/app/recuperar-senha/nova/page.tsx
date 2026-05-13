"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function NovaSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/nova-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao redefinir senha"); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (!token) return (
    <div className="text-center py-8">
      <p style={{ color: "var(--danger)" }}>Link inválido.</p>
      <Link href="/recuperar-senha" className="text-sm font-semibold mt-3 inline-block hover:underline" style={{ color: "var(--primary)" }}>Solicitar novo link</Link>
    </div>
  );

  return done ? (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">✅</div>
      <h2 className="text-lg font-semibold mb-2">Senha redefinida!</h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Redirecionando para o login...</p>
    </div>
  ) : (
    <>
      <h2 className="text-lg font-semibold mb-2">Nova senha</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Escolha uma senha com pelo menos 6 caracteres.</p>
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee2e2", color: "var(--danger)" }}>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Nova senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Confirmar senha</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: "var(--primary)", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </>
  );
}

export default function NovaSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📅</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</h1>
        </div>
        <div className="rounded-2xl shadow-sm p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Suspense fallback={<p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Carregando...</p>}>
            <NovaSenhaForm />
          </Suspense>
        </div>
        <p className="text-center text-sm mt-5">
          <Link href="/login" className="hover:underline" style={{ color: "var(--muted)" }}>← Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
