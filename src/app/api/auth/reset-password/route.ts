import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Sempre retorna ok para não revelar se e-mail existe
  if (!user) return NextResponse.json({ ok: true });

  // Limpa tokens antigos do mesmo e-mail
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

  const link = `${process.env.NEXTAUTH_URL}/recuperar-senha/nova?token=${token}`;

  await resend.emails.send({
    from: "Sassalão <noreply@sassalao.com.br>",
    to: email,
    subject: "Redefinir senha — Sassalão",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#7c3aed;margin-bottom:8px">Redefinir senha</h2>
        <p style="color:#555;margin-bottom:24px">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Sassalão</strong>.
          Clique no botão abaixo — o link expira em 1 hora.
        </p>
        <a href="${link}"
          style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">
          Redefinir senha
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          Se você não solicitou a redefinição, ignore este e-mail.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
