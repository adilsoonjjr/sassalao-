"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-mail ou senha incorretos");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary-dark)" }}>Sassalão</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Gestão simples para sua beleza</p>
        </div>

        <div className="rounded-2xl shadow-sm p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold mb-5">Entrar na conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fee", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              />
            </div>

            <div className="text-right">
              <Link href="/recuperar-senha" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity"
              style={{ background: "var(--primary)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--muted)" }}>
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
