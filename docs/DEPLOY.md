# Deploy

## Hospedagem

- **App:** Render (referenciado no README como `https://jhv-agrosystem.onrender.com`).
- **Banco:** Supabase (PostgreSQL).
- **CI:** GitHub Actions roda `npm test` a cada push em `master` e a cada pull request (`.github/workflows/tests.yml`).

## Variáveis de produção

No serviço do Render, configurar todas as variáveis listadas em [SETUP.md](./SETUP.md#variáveis-de-ambiente-env), com `NEXTAUTH_URL` apontando para o domínio real (necessário para o webhook do Mercado Pago funcionar — não funciona em `localhost`).

## Build

`npm run build` roda `prisma generate && next build`. Rodar as migrations pendentes (`npx prisma migrate deploy`) contra o banco de produção faz parte do processo de deploy — confirmar se o Render está configurado para isso automaticamente ou se precisa ser rodado manualmente antes/depois do deploy.

## Jobs agendados (GitHub Actions)

Dois workflows chamam endpoints da própria aplicação via HTTP, autenticados por um secret compartilhado:

- **`faturamento-diario.yml`** — todo dia às 10h UTC, `POST /api/cron/faturamento` (gera cobranças recorrentes do dia e reemite boletos vencidos com juros/multa).
- **`notificacoes-diarias.yml`** — todo dia às 11h UTC, `POST /api/cron/notificacoes` (gera as pendências de vencido/vencendo mostradas no sino de notificações).

Ambos exigem, no repositório GitHub (Settings → Secrets and variables → Actions):

- **Secret** `CRON_SECRET` — mesmo valor configurado no Render.
- **Variable** `APP_URL` — URL pública da aplicação (ex: `https://jhv-agrosystem.onrender.com`).

Os endpoints validam o header `x-cron-secret` contra `CRON_SECRET` antes de executar qualquer coisa.

## Webhooks

- **Mercado Pago** (`/api/webhooks/mercadopago`) — baixa automática de boleto quando compensado. Exige `NEXTAUTH_URL`/domínio público configurado no Mercado Pago.
- **WhatsApp** (`/api/webhooks/whatsapp`) — recebe mensagens e status de entrega/leitura. Exige `WHATSAPP_WEBHOOK_VERIFY_TOKEN` e a URL pública cadastrada no Meta Business Manager.

## Uploads

Fotos/documentos de animais em `public/uploads/` (fora do controle de versão, `.gitignore`). Em Render isso é efêmero entre deploys — migrar para storage externo (S3, Supabase Storage) antes de depender disso em produção de forma séria.
