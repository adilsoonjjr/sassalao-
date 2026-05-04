"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar");
        setLoading(false);
        return;
      }
      router.push("/login?cadastro=ok");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary-dark)" }}>Sassalão</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Crie sua conta gratuita</p>
        </div>

        <div className="rounded-2xl shadow-sm p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold mb-5">Criar conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Nome completo</label>
              <input name="name" type="text" value={form.name} onChange={onChange} placeholder="Seu nome" required className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>E-mail</label>
              <input name="email" type="email" value={form.email} onChange={onChange} placeholder="seu@email.com" required className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>WhatsApp (opcional)</label>
              <input name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="(11) 99999-9999" className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Senha</label>
              <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo 6 caracteres" required className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Confirmar senha</label>
              <input name="confirm" type="password" value={form.confirm} onChange={onChange} placeholder="Repita a senha" required className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid var(--border)", background: "var(--background)" }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity mt-2"
              style={{ background: "var(--primary)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--muted)" }}>
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
