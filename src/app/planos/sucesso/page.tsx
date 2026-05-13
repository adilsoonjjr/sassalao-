"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PagamentoSucessoPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Pagamento confirmado!</h1>
        <p className="mb-6" style={{ color: "var(--muted)" }}>
          Sua assinatura está ativa. Bem-vindo ao Beleza em Dia!
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Redirecionando para o app em instantes...
        </p>
      </div>
    </div>
  );
}
