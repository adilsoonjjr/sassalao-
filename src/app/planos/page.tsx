"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface StatusData {
  valida: boolean;
  status: string;
  diasRestantes?: number;
}

export default function PlanosPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<"mensal" | "anual" | null>(null);

  useEffect(() => {
    fetch("/api/assinatura/status")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  async function assinar(plano: "mensal" | "anual") {
    setLoading(plano);
    try {
      const res = await fetch("/api/assinatura/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao iniciar pagamento. Tente novamente.");
        setLoading(null);
      }
    } catch {
      alert("Erro ao iniciar pagamento. Verifique sua conexão e tente novamente.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--background)" }}>
      <div className="text-center mb-8">
        <img src="/logo.svg" alt="Beleza em Dia" className="w-16 h-16 mx-auto" />
        <h1 className="text-2xl font-bold mt-2" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</h1>

        {status?.status === "expired" && (
          <div className="mt-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#fee", color: "var(--danger)" }}>
            ⚠️ Seu período de teste expirou. Escolha um plano para continuar.
          </div>
        )}
        {status?.status === "trial" && (
          <div className="mt-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
            🎉 Você ainda tem <strong>{status.diasRestantes} dia(s)</strong> de teste gratuito.
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4">

        {/* Plano Mensal */}
        <div className="rounded-3xl p-6 shadow-sm" style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--muted)" }}>Mensal</p>
          <div className="mb-4">
            <span className="text-4xl font-bold">R$ 19,90</span>
            <span style={{ color: "var(--muted)" }}>/mês</span>
          </div>
          <ul className="text-sm space-y-2 mb-6" style={{ color: "var(--muted)" }}>
            <li>✅ Agendamentos ilimitados</li>
            <li>✅ WhatsApp integrado</li>
            <li>✅ Financeiro completo</li>
            <li>✅ Relatórios e gráficos</li>
            <li>✅ Suporte por WhatsApp</li>
          </ul>
          <button
            onClick={() => assinar("mensal")}
            disabled={loading !== null}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            {loading === "mensal" ? "Aguarde..." : "Assinar mensal"}
          </button>
        </div>

        {/* Plano Anual */}
        <div className="rounded-3xl p-6 shadow-xl relative overflow-hidden" style={{ background: "var(--primary)", color: "white" }}>
          <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full" style={{ background: "white", color: "var(--primary)" }}>
            2 meses grátis
          </div>
          <p className="text-sm font-semibold mb-1 opacity-80">Anual · Melhor valor</p>
          <div className="mb-1">
            <span className="text-4xl font-bold">R$ 199</span>
            <span className="opacity-80">/ano</span>
          </div>
          <p className="text-xs mb-4 opacity-70">equivale a R$ 16,58/mês</p>
          <ul className="text-sm space-y-2 mb-6 opacity-90">
            <li>✅ Tudo do plano mensal</li>
            <li>✅ Prioridade no suporte</li>
            <li>✅ Acesso a novas funções</li>
            <li>✅ Economia de R$ 39,80/ano</li>
            <li>&nbsp;</li>
          </ul>
          <button
            onClick={() => assinar("anual")}
            disabled={loading !== null}
            className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "white", color: "var(--primary)" }}
          >
            {loading === "anual" ? "Aguarde..." : "Assinar anual"}
          </button>
        </div>
      </div>

      {/* Se ainda está em trial, deixa continuar */}
      {status?.valida && status.status === "trial" && (
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-sm hover:underline"
          style={{ color: "var(--muted)" }}
        >
          Continuar no teste gratuito →
        </button>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 text-xs hover:underline"
        style={{ color: "var(--muted)" }}
      >
        Sair da conta
      </button>
    </div>
  );
}
