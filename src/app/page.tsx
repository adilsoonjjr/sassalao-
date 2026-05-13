import Link from "next/link";

const features = [
  { icon: "📅", title: "Agenda inteligente", desc: "Crie, edite e cancele agendamentos em segundos. Veja o dia todo de um olhar." },
  { icon: "📲", title: "Aviso no WhatsApp", desc: "Notifique o cliente automaticamente quando o agendamento é criado." },
  { icon: "💰", title: "Controle financeiro", desc: "Registre entradas e gastos. Só entra no caixa quando o serviço é concluído." },
  { icon: "📊", title: "Relatórios e gráficos", desc: "Faturamento mensal, ticket médio, serviço mais realizado e muito mais." },
  { icon: "🔒", title: "Dados 100% seus", desc: "Cada profissional tem acesso só aos próprios dados. Seguro e privado." },
  { icon: "📱", title: "Funciona em qualquer tela", desc: "No celular, tablet ou computador. Sem instalar nada." },
];

const depoimentos = [
  { nome: "Ana Paula", prof: "Cabeleireira", texto: "Antes anotava tudo no caderno e perdia cliente. Agora tenho tudo organizado e ainda aviso pelo WhatsApp." },
  { nome: "Bruna Melo", prof: "Manicure", texto: "O financeiro me mostrou que eu estava no prejuízo sem saber. Agora sei exatamente quanto lucro." },
  { nome: "Carla Souza", prof: "Esteticista", texto: "Simples demais. Em 5 minutos já estava usando. Super recomendo!" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Beleza em Dia" className="w-8 h-8" />
          <span className="font-bold text-lg" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: "var(--muted)" }}>
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: "var(--primary)" }}
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-16 max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
          ✨ 7 dias grátis · Sem cartão de crédito
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
          Agenda e financeiro<br />
          <span style={{ color: "var(--primary)" }}>para profissionais de beleza</span>
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          Pare de usar caderno, planilha e cabeça. O Beleza em Dia organiza sua agenda, avisa seus clientes pelo WhatsApp e mostra exatamente quanto você está lucrando.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cadastro"
            className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-opacity hover:opacity-85 shadow-lg"
            style={{ background: "var(--primary)" }}
          >
            Começar 7 dias grátis →
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-base font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}
          >
            Já tenho conta
          </Link>
        </div>
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          Após o teste, apenas R$ 19,90/mês. Cancele quando quiser.
        </p>
      </section>

      {/* Preview do app — card visual */}
      <section className="px-6 max-w-2xl mx-auto mb-16">
        <div className="rounded-3xl p-6 shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs ml-2 font-medium" style={{ color: "var(--muted)" }}>Agenda de Hoje</span>
          </div>
          {[
            { nome: "Juliana Costa", servico: "Corte + escova", horario: "09:00", valor: "R$ 80", status: "concluido", cor: "#4caf7d" },
            { nome: "Fernanda Lima", servico: "Mechas", horario: "11:00", valor: "R$ 180", status: "agendado", cor: "#f0a030" },
            { nome: "Patrícia Ramos", servico: "Hidratação", horario: "14:30", valor: "R$ 60", status: "agendado", cor: "#f0a030" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: "var(--background)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
                  {item.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.nome}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{item.servico}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{item.horario}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: item.cor + "22", color: item.cor }}>
                  {item.status === "concluido" ? "Concluído" : "Agendado"}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t flex justify-between text-sm" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--muted)" }}>Faturado hoje</span>
            <span className="font-bold" style={{ color: "var(--success)" }}>R$ 320,00</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">Tudo que você precisa, sem complicação</h2>
        <p className="text-center mb-10" style={{ color: "var(--muted)" }}>Feito para quem trabalha sozinho ou com pequena equipe</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Profissionais que já usam</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {depoimentos.map((d, i) => (
            <div key={i} className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-sm mb-4 italic" style={{ color: "var(--muted)" }}>"{d.texto}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
                  {d.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{d.nome}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{d.prof}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preço */}
      <section className="px-6 py-16 max-w-md mx-auto text-center" id="preco">
        <h2 className="text-2xl font-bold mb-2">Um preço simples</h2>
        <p className="mb-8" style={{ color: "var(--muted)" }}>Sem surpresas, sem contratos longos</p>
        <div className="rounded-3xl p-8 shadow-xl" style={{ background: "var(--card)", border: "2px solid var(--primary)" }}>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "var(--accent)", color: "var(--primary-dark)" }}>
            Mais popular
          </div>
          <div className="mb-1">
            <span className="text-5xl font-bold">R$ 19,90</span>
            <span style={{ color: "var(--muted)" }}>/mês</span>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>ou R$ 199/ano (2 meses grátis)</p>
          <ul className="text-sm text-left space-y-2 mb-8">
            {[
              "✅ Agendamentos ilimitados",
              "✅ Notificações WhatsApp",
              "✅ Controle financeiro completo",
              "✅ Relatórios e gráficos",
              "✅ Acesso em qualquer dispositivo",
              "✅ Suporte por WhatsApp",
              "✅ 7 dias grátis para testar",
            ].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <Link
            href="/cadastro"
            className="block w-full py-4 rounded-2xl font-bold text-white text-base transition-opacity hover:opacity-85"
            style={{ background: "var(--primary)" }}
          >
            Começar 7 dias grátis
          </Link>
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>Cancele quando quiser · Sem fidelidade</p>
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center px-6 py-16" style={{ background: "var(--accent)" }}>
        <h2 className="text-2xl font-bold mb-3">Pronto para organizar sua agenda?</h2>
        <p className="mb-6" style={{ color: "var(--muted)" }}>Começa grátis. Se gostar, fica. Se não gostar, cancela.</p>
        <Link
          href="/cadastro"
          className="inline-block px-10 py-4 rounded-2xl font-bold text-white text-base transition-opacity hover:opacity-85 shadow-lg"
          style={{ background: "var(--primary)" }}
        >
          Criar conta gratuita →
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.svg" alt="Beleza em Dia" className="w-6 h-6" />
          <span className="font-bold" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</span>
        </div>
        <p>© {new Date().getFullYear()} Beleza em Dia · Agenda e financeiro para profissionais de beleza</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/login" className="hover:underline">Entrar</Link>
          <Link href="/cadastro" className="hover:underline">Cadastrar</Link>
        </div>
      </footer>
    </div>
  );
}
