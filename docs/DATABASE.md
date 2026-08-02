# Banco de dados

Único schema em `prisma/schema.prisma`, PostgreSQL (Supabase). Todos os IDs são `cuid()`. A maioria das entidades de negócio tem `organizationId` (multi-tenancy — ver [ARCHITECTURE.md](./ARCHITECTURE.md)).

## Comandos

```bash
npx prisma studio          # explorar o banco visualmente
npx prisma migrate dev      # criar/aplicar uma migration a partir de mudanças no schema.prisma
npm run db:push             # aplicar o schema direto no banco, sem gerar migration (evitar em produção)
npm run db:seed             # recria o usuário admin + plano de contas padrão (idempotente)
```

Toda alteração de schema que for para produção deve passar por `prisma migrate dev` (gera uma migration versionada em `prisma/migrations/`) — não usar `db:push` em cima do banco de produção, porque não fica registrado no histórico de migrations e pode divergir do que os outros colaboradores têm localmente.

> ⚠️ **Nunca aponte `--shadow-database-url` (ou qualquer comando de diff/resolve do Prisma) para o `DATABASE_URL` real.** O shadow database é onde o Prisma testa migrations recriando o schema do zero — se ele apontar sem querer para o banco de verdade, os dados são apagados. Se encontrar um drift entre `prisma/migrations/` e o banco real (tabelas criadas por `db push` fora do histórico, por exemplo), pare e peça confirmação antes de rodar qualquer comando de correção — idealmente com um backup (`pg_dump`) tirado antes. Isso já aconteceu uma vez neste projeto (ver nota em [Migrations](#migrations)).

## Modelos centrais

- **`Organization`** — um cliente da JHV. Guarda `allowedModules`, moeda de exibição, credenciais de integração por organização (Mercado Pago, Resend), e é o ponto de isolamento de todos os módulos.
- **`Property`** — fazenda/propriedade dentro de uma organização (uma organização pode ter várias). Hoje referenciada só por Talhão, Pastagem e Piquete.
- **`User`** — usuário do sistema. `role` (`ADMIN`/`GERENTE`/`FUNCIONARIO`), `isSuperAdmin`, `allowedModules`, vínculo opcional com `Organization` (super admin não tem organização).
- **`ApiKey`** — chaves para a API pública somente leitura (`/api/v1`).
- **`AuditLog`** — trilha de auditoria (create/update/delete) por organização.
- **`Notification`** — pendências (vencido/vencendo) geradas pelo cron diário.

## Modelos por módulo

| Módulo | Modelos principais |
|---|---|
| Cadastro | `Owner`, `Employee`, `Veterinarian`, `Farrier`, `Instructor`, `Handler`, `Client`, `Supplier`, `Animal` (+ `AnimalPhoto`, `AnimalDocument`) |
| Hípica | `TrainingSession`, `AnimalDiet`, `EquineHealthRecord`, `Stall`/`StallEvent`, `Piquete`/`PiqueteEvent`, `AgendaEvent`, `Competition`, `Transport`/`TransportAnimal`, `FinancialEntry`, `AnimalTransaction`, `Contract` |
| Pecuária | `Lote`, `Pasture`, `LivestockAnimal`, `Reproduction`, `HealthRecord`, `WeightRecord`, `MilkProduction`, `LivestockFeeding`, `ManagementMovement` |
| Agricultura | `Talhao`, `Safra`, `Plantio`, `TratoCultural`, `Fertility`, `Irrigation`, `Harvest`, `Storage`/`StorageMovement` |
| Máquinas e Equipamentos | `Machine`, `UsageLog`, `Maintenance` |
| Estoque | `StockItem`, `StockBatch` |
| Compras | `PurchaseRequest`, `Quotation`, `PurchaseOrder` |
| Financeiro | `CostCenter`, `FinanceEntry`, `RecurringBilling` |
| Contabilidade | `ChartAccount` (hierárquico), `JournalEntry`/`JournalEntryLine` |
| Recursos Humanos | `Attendance`, `Schedule`, `Training`, `EpiIssuance` (todos ligados a `Employee`) |
| Oficina | `Mechanic`, `ServiceOrder`/`ServiceOrderPart` |
| Integrações | `WhatsappConnection`, `WhatsappMessage` |
| Viveiro de Mudas *(fases 1 e 2 de 3 — ver [MODULES.md](./MODULES.md))* | `MudaEspecie`, `Viveiro`, `MudaLote`, `MudaFaseEvento`, `MudaLoteInsumo`, `MudaLoteIrrigacao`, `MudaLoteFitossanidade`, `MudaLoteMaoDeObra` |

## Relações que cruzam módulos

Vale ter em mente ao mexer no schema, porque não são óbvias:

- `Animal` (Cadastro/Hípica) tem genealogia própria (`paiId`/`maeId` auto-relacionamento) e é referenciado por praticamente todo o módulo Hípica, além de `Contract`.
- `StockItem`/`StockBatch` (Estoque) é consumido por `PurchaseRequest` (Compras) e por `ServiceOrderPart` (Oficina) — dar baixa em estoque em um desses fluxos afeta a mesma tabela.
- `Machine` (Máquinas) é referenciada por `ServiceOrder` (Oficina) e por `UsageLog` (que por sua vez referencia `Talhao`, da Agricultura).
- `Safra` (Agricultura) referencia `Talhao` e é referenciada por `StorageMovement` (armazenagem calcula estoque de silo/armazém a partir dela).
- `FinanceEntry` (Financeiro) se conecta com `Client`/`Supplier`/`CostCenter`/`RecurringBilling`, e guarda os campos do boleto Mercado Pago (`mpPaymentId`, `boletoUrl`, `boletoBarcode`).
- `Contract` (Hípica) referencia `Stall` **ou** `Piquete` **ou** nenhum (aulas), conforme `ContractType`.

## Migrations

Uma migration por módulo (ordem cronológica em `prisma/migrations/`): `init` (Cadastro/base) → `hipica` → `pecuaria` → `agricultura` → `maquinas` → `estoque` → `compras` → `financeiro` → `rh` → `oficina`. Módulos adicionados depois (Contabilidade, Piquetes/Contratos, multi-propriedade, WhatsApp, API pública, Viveiro de Mudas etc.) têm suas próprias migrations subsequentes — sempre rode `npx prisma migrate dev` para gerá-las, nunca edite uma migration já aplicada em produção.

> **Nota (29/07/2026):** havia um drift entre `prisma/migrations/` e o banco real — várias tabelas (organizations, contracts, piquetes etc.) tinham sido criadas em algum momento via `db push`, fora do histórico de migrations rastreado. Ao resolver esse drift, um comando de diff apontou por engano `--shadow-database-url` para o banco de produção (Supabase), o que apagou os dados de todas as tabelas (só dados de teste, sem impacto real). O schema completo — as tabelas que faltavam no histórico + as 4 novas do Viveiro de Mudas (`migration 20260729115806_viveiro_cadastros_lotes_fases`) — foi recriado numa migration única, e o seed foi rodado de novo. A partir dessa migration, o histórico em `prisma/migrations/` e o banco real estão consistentes. Ver o aviso sobre `--shadow-database-url` acima — vale mais cuidado em qualquer resolução de drift futura, idealmente com backup antes.
