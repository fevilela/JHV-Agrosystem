# Setup local

## Pré-requisitos

- Node.js 20+
- Acesso ao banco PostgreSQL do projeto (Supabase) ou uma instância própria

## Passo a passo

```bash
npm install
cp .env.example .env   # preencher com os valores reais (pedir ao time)
npx prisma generate
npm run db:seed        # cria o usuário admin
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Usuário administrador (criado pelo seed)

- **E-mail:** admin@jhvagrosystem.com
- **Senha:** Admin@123

Troque em produção assim que possível (ainda não há tela própria de troca de senha — pode ser feito direto no banco).

## Variáveis de ambiente (`.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Conexão PostgreSQL (Supabase) |
| `AUTH_SECRET` | Sim | Secret do NextAuth — gerar com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Sim | URL base da aplicação (`http://localhost:3000` em dev) |
| `MERCADOPAGO_ACCESS_TOKEN` | Só p/ boleto | Token da API de Pagamentos do Mercado Pago (`APP_USR-...` prod, `TEST-...` sandbox) |
| `MERCADOPAGO_PUBLIC_KEY` / `_CLIENT_ID` / `_CLIENT_SECRET` | Só p/ boleto | Demais credenciais Mercado Pago |
| `CRON_SECRET` | Só p/ crons | Compara com o header `x-cron-secret` nos endpoints `/api/cron/*` — gerar com `openssl rand -hex 32` |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_TEMPLATE_NAME` | Só p/ WhatsApp | Fallback de env vars — pode ser configurado por organização em `/configuracoes/whatsapp` em vez disso |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Só p/ WhatsApp | Verificação do webhook da Meta |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Só p/ push | Chaves Web Push — gerar com `node -e "console.log(require('web-push').generateVAPIDKeys())"` |

`.env` nunca deve ser commitado (já está no `.gitignore`) — cada pessoa/ambiente tem o seu.

## Comandos úteis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # prisma generate + build de produção
npm run start        # roda o build de produção
npm run lint         # eslint
npm test             # vitest (roda também no CI a cada push/PR — ver .github/workflows/tests.yml)
npm run db:studio    # Prisma Studio
npm run db:migrate   # prisma migrate dev
```

Mais detalhes de banco em [DATABASE.md](./DATABASE.md), de integrações no [README](../README.md), e de deploy em [DEPLOY.md](./DEPLOY.md).
