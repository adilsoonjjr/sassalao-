# Guia de Deploy — Sassalão

## Passo 1 — Banco de dados (Neon — PostgreSQL gratuito)

1. Acesse https://neon.tech e crie conta
2. Crie um projeto chamado "sassalao"
3. Copie as duas URLs: **DATABASE_URL** e **DIRECT_URL**

## Passo 2 — Código no GitHub

```bash
git init
git add .
git commit -m "MVP Sassalão"
git remote add origin https://github.com/SEU_USUARIO/sassalao.git
git push -u origin main
```

## Passo 3 — Preparar para PostgreSQL

Substitua os arquivos:
```bash
# Schema do banco
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Cliente Prisma (sem adapter)
cp src/lib/prisma.production.ts src/lib/prisma.ts
```

Gere o cliente e rode as migrations:
```bash
npx prisma migrate deploy
```

## Passo 4 — Deploy na Vercel

1. Acesse https://vercel.com e faça login com GitHub
2. Clique em "Add New Project" → selecione o repositório sassalao
3. Configure as variáveis de ambiente:

```
DATABASE_URL=          # URL do Neon (pooler)
DIRECT_URL=            # URL direta do Neon
NEXTAUTH_SECRET=       # string aleatória longa (use: openssl rand -base64 32)
NEXTAUTH_URL=          # https://seu-dominio.vercel.app
MERCADOPAGO_ACCESS_TOKEN=  # do painel do Mercado Pago
ADMIN_EMAIL=           # seu e-mail (acesso ao painel /admin)
```

4. Clique em Deploy

## Passo 5 — Mercado Pago

1. Acesse https://www.mercadopago.com.br/developers
2. Crie um aplicativo
3. Copie o **Access Token** de produção
4. Configure a URL do webhook no painel MP:
   - URL: `https://seu-dominio.vercel.app/api/webhook/mercadopago`
   - Eventos: `payment`

## Passo 6 — Domínio personalizado (opcional)

No painel da Vercel: Settings → Domains → adicione seu domínio.

---

## Variáveis de ambiente — resumo

| Variável | Onde pegar |
|----------|-----------|
| DATABASE_URL | Neon → Connection string (pooler) |
| DIRECT_URL | Neon → Connection string (direct) |
| NEXTAUTH_SECRET | Gere com `openssl rand -base64 32` |
| NEXTAUTH_URL | URL da Vercel ou seu domínio |
| MERCADOPAGO_ACCESS_TOKEN | Mercado Pago Developers |
| ADMIN_EMAIL | Seu e-mail de admin |
