# Arquitetura

## Stack

- **Next.js 16 (App Router)** + TypeScript, React 19.
- **Tailwind CSS 4** para estilo.
- **Prisma 6** como ORM sobre **PostgreSQL** (hospedado no Supabase).
- **NextAuth v5 (beta)** com provider Credentials (e-mail/senha), sessão JWT.
- **next-intl** para i18n (pt-BR, es, en).
- **Vitest** para testes automatizados.
- Integrações externas: Mercado Pago (boleto), WhatsApp Business Platform (Meta), Resend (e-mail), Web Push (notificações push).

## Estrutura de pastas

```
src/
  app/
    (app)/            # Rotas autenticadas, uma pasta por módulo (hipica, pecuaria, agricultura, ...)
    admin/             # Painel super-admin: gestão de organizações e usuários
    api/
      auth/            # NextAuth
      cron/            # Endpoints chamados pelos GitHub Actions (faturamento, notificações)
      export/[modulo]/ # Exportação CSV/Excel genérica por módulo
      sync/            # Endpoints usados pela fila offline (PWA)
      v1/              # API pública somente leitura (autenticada por API key)
      webhooks/        # Mercado Pago e WhatsApp
    login/, offline/, privacidade/, contrato-publico/  # Rotas públicas
  components/          # Componentes de UI (crud genérico, dashboard, layout, mapa, pecuária)
  lib/                 # Lógica de domínio, auth, tenant, integrações
  i18n/                # Configuração next-intl
  middleware.ts        # Proteção de rotas (redireciona não-autenticados pro /login)
prisma/
  schema.prisma        # Schema único com todos os módulos
  migrations/          # Uma migration por módulo, em ordem cronológica
  seed.ts              # Cria usuário admin + plano de contas padrão
messages/              # Traduções (pt-BR.json, es.json, en.json)
scripts/                # Scripts utilitários (ex: backfill de organizationId)
```

## Multi-tenancy (organizações)

O sistema é multi-tenant: cada cliente da JHV é uma `Organization`. Praticamente toda entidade de negócio tem `organizationId` e é sempre filtrada por ele — não existe consulta "global" a dados de outra organização fora do painel `/admin`.

- **Super admin** (`User.isSuperAdmin = true`): não pertence a nenhuma organização, acessa só `/admin`, onde cria/edita organizações e usuários. Ver `src/app/admin/`.
- **Usuário de organização**: pertence a uma `Organization` (`User.organizationId`). Tem `role` (`ADMIN`, `GERENTE`, `FUNCIONARIO`) e uma lista `allowedModules` (módulos liberados individualmente).
- **Módulos liberados**: cada `Organization` tem seu próprio `allowedModules`. Um `ADMIN` de organização vê tudo que a organização libera; os demais roles só veem a interseção entre `allowedModules` do usuário e da organização (nunca mais do que a organização permite). Essa regra está centralizada em `requireOrg()` (`src/lib/tenant.ts`).
- **Propriedades (fazendas)**: uma organização pode ter mais de uma `Property` (fazenda). Hoje só as entidades geográficas (Talhão, Pastagem, Piquete) referenciam `propertyId` — os demais módulos continuam escopados só por organização.

### Guards de acesso (`src/lib/tenant.ts`)

- `getTenantContext()` — lê a sessão; redireciona pro `/login` se não autenticado.
- `requireOrg()` — garante que o usuário pertence a uma organização ativa; calcula `effectiveModules`. Usado no topo de toda página autenticada de módulo.
- `requireModule(moduleKey)` — além de `requireOrg()`, redireciona pra `/` se o módulo não estiver liberado para o usuário.
- `requireSuperAdmin()` — protege as rotas de `/admin`.
- `getApiOrgContext()` — variante sem redirect, usada em Route Handlers (`/api/...`), onde `redirect()` do `next/navigation` não funciona.

### `src/middleware.ts`

Redireciona qualquer requisição não autenticada para `/login`, exceto rotas explicitamente públicas (`/privacidade`, `/contrato-publico`, `/offline`, arquivos de imagem, `sw.js`, manifest). O matcher exclui extensões de imagem para não quebrar assets servidos sem sessão (ex: logo na tela de login — ver histórico desse bug no README).

## Autenticação (`src/lib/auth.ts`)

NextAuth v5 com Credentials: e-mail/senha, hash com `bcryptjs`, sessão JWT (sem sessão em banco). O callback `jwt`/`session` propaga `role`, `isSuperAdmin` e `organizationId` para o objeto de sessão, usado por todo o resto do app para autorização.

## Padrão de CRUD genérico

Vários cadastros simples (Proprietários, Clientes, Fornecedores, Funcionários, Veterinários, Ferradores, Instrutores, Tratadores) compartilham a mesma forma id/CRUD e são implementados de forma genérica:

- `src/lib/entities.ts` — define `EntityConfig`/`EntityField` por entidade (nome do model Prisma, campos, tipos).
- `src/lib/crud.ts` — `listEntities`, `getEntity`, `createEntityRecord`, etc., acessando o delegate do Prisma dinamicamente pelo nome do model, e registrando auditoria (`src/lib/audit.ts`) em toda escrita.
- `src/components/crud/` — formulários e tabelas genéricos que consomem `EntityConfig`.

Módulos com regras de negócio mais específicas (Hípica, Pecuária, Agricultura, Financeiro, Contabilidade etc.) têm suas próprias Server Actions/rotas, fora desse padrão genérico.

## Outras peças relevantes

- **Auditoria** (`src/lib/audit.ts`): toda criação/edição/remoção feita pelo CRUD genérico grava um `AuditLog` (ator, ação, entidade, diff). Consultável em Configurações → Log de Auditoria.
- **Notificações** (`src/lib/pendencias.ts`, model `Notification`): pendências (vencido/vencendo) calculadas a partir de datas de validade/vencimento espalhadas pelo sistema (estoque, EPI, manutenção, financeiro etc.), geradas pelo cron diário e exibidas no sino de notificações + push (Web Push).
- **Exportação** (`src/lib/export.ts`, `/api/export/[modulo]`): exportação genérica CSV/Excel por módulo.
- **Offline (PWA)** (`src/lib/offline-queue.ts`, `src/lib/offline-pages.ts`, `public/sw.js`): fila de escrita em IndexedDB para uso em campo sem conexão; sincroniza via `/api/sync/*` quando a conexão volta.
- **API pública** (`src/app/api/v1/`, model `ApiKey`): API somente leitura para integrações externas, autenticada por API key (não por sessão).
- **i18n** (`src/i18n/`, `messages/`): locale por cookie, com fallback pt-BR; `Client.locale`/`User.locale` guardam a preferência de cada pessoa/cliente.
