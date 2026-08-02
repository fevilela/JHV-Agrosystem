# Contexto

O módulo Viveiro de Mudas (`viveiro`) teve sua fase 1 de 3 implementada e mergeada: Espécies e
Cultivares (`MudaEspecie`), Estrutura Física (`Viveiro`), Lotes de Produção (`MudaLote` +
histórico de fases em `MudaFaseEvento`) — ver `docs/MODULES.md` e `docs/DATABASE.md`. Esse prompt
implementa a fase 2, planejada mas ainda não construída: insumos/substrato (consumindo do Estoque),
irrigação, fitossanidade e mão de obra, tudo por lote de produção (`MudaLote`).

Padrão já usado no projeto pra consumir estoque a partir de outro módulo (seguir o mesmo em vez de
inventar um novo): `ServiceOrderPart` (Oficina, em `src/app/(app)/oficina/ordens-servico/actions.ts`)
— ao registrar consumo, `$transaction` cria o registro de consumo E decrementa
`StockItem.currentQuantity` na mesma transação; ao excluir o consumo, reverte com `increment`.

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b feature/viveiro-fase-2
```

# Tarefa

## 1. Schema

Adicionar ao `prisma/schema.prisma`, todos relacionados a `MudaLote` (via `loteId`, com
`onDelete: Cascade` a partir do lote, mesmo padrão de `MudaFaseEvento`):

- **`MudaLoteInsumo`** — consumo de insumo/substrato do Estoque num lote: `loteId`, `stockItemId`
  (`StockItem`, já existe), `quantidade`, `unitCost?` (`Decimal? @db.Decimal(10,2)` — mesmo padrão
  de `ServiceOrderPart.unitCost`, guarda o custo unitário no momento do consumo pra viabilizar
  cálculo de custo por lote na fase 3), `data` (default `now()`), `notes?`. Seguir o padrão do
  `ServiceOrderPart` pra decrementar/incrementar `StockItem.currentQuantity` em transação ao
  criar/excluir.
- **`MudaLoteIrrigacao`** — evento de irrigação: `loteId`, `data` (default `now()`), método/sistema
  (`String?`, ex. gotejo/aspersão/manual — pode reusar texto livre, `Viveiro.sistemaIrrigacao` já
  é `String?` também), duração ou volume (`Decimal?` ou `Int?`, decida a unidade mais natural —
  minutos é razoável), `responsavelId?` (`Employee`), `notes?`.
- **`MudaLoteFitossanidade`** — evento fitossanitário: `loteId`, `data` (default `now()`), `tipo`
  (enum: `PRAGA`, `DOENCA`, `TRATAMENTO_PREVENTIVO`), `produtoAplicado?` (`String?`),
  `dosagem?` (`String?`), `responsavelId?` (`Employee`), `notes?`.
- **`MudaLoteMaoDeObra`** — apontamento de mão de obra: `loteId`, `employeeId` (`Employee`,
  obrigatório), `data` (default `now()`), `atividade` (`String`, ex. "repicagem", "poda"),
  `horasTrabalhadas` (`Decimal @db.Decimal(5,2)`), `custoHora?` (`Decimal? @db.Decimal(10,2)` —
  opcional, guarda o valor/hora no momento do apontamento pra viabilizar cálculo de custo por lote
  na fase 3, que vai ser implementada depois), `notes?`.

Todos com `organizationId` (seguir o padrão de isolamento multi-tenant já usado em todo o schema —
ver `ARCHITECTURE.md`) e `createdAt`. Gerar a migration com
`npx prisma migrate dev --name viveiro_fase_2_insumos_irrigacao_fitossanidade_mao_de_obra`.

## 2. UI

Na página de detalhe do lote (`src/app/(app)/viveiro/lotes/[id]/page.tsx`), que hoje mostra o
histórico de fases (`MudaFaseEvento`), adicionar seções (ou abas, se a página já estiver com esse
padrão — conferir como `Animal` faz abas de Saúde/Histórico em
`src/app/(app)/cadastro/animais/[id]/page.tsx` e reaproveitar o mesmo componente/padrão visual se
existir um reutilizável) para:

- Insumos consumidos: lista + formulário pra registrar consumo (seleciona `StockItem`, quantidade).
- Irrigação: lista + formulário de novo evento.
- Fitossanidade: lista + formulário de novo evento.
- Mão de obra: lista + formulário de novo apontamento (seleciona `Employee`).

Cada seção segue o padrão de `actions.ts` (server actions) já usado em todo o projeto — conferir
`src/app/(app)/viveiro/lotes/actions.ts` existente pra manter o mesmo estilo de código
(`requireOrg`, revalidatePath, etc.).

## 3. i18n e navegação

Adicionar rótulos novos em `messages/pt-BR.json`, `messages/en.json`, `messages/es.json` (ver
`src/lib/labels.ts`) seguindo o padrão já usado nas outras seções do Viveiro. Não precisa adicionar
itens novos em `src/lib/nav.ts` — essas seções vivem dentro da página de detalhe do lote, não são
rotas novas no menu.

## 4. Documentação

Atualizar `docs/MODULES.md` (parágrafo do Viveiro de Mudas) e `docs/DATABASE.md` (linha da tabela
de módulos) refletindo que a fase 2 foi implementada — mas deixar claro que a fase 3 (estoque de
mudas prontas, pedido de venda, custos, rastreabilidade/certificação) continua pendente.

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example`, nem em `.claude/settings.local.json`.
- Gerar a migration com `npx prisma migrate dev` (nunca `db:push` em cima de dado real).
- Nunca aponte comandos de diff/resolve do Prisma (`--shadow-database-url` ou similar) para o
  `DATABASE_URL` real — ver `docs/DATABASE.md` sobre o incidente anterior. Se encontrar drift, pare
  e pergunte antes de corrigir.
- Consumo de insumo não pode deixar `StockItem.currentQuantity` negativo sem aviso — seguir o
  mesmo tratamento de validação que `ServiceOrderPart` já faz (conferir e replicar).
- Rodar `npm test` e `npm run lint` antes de considerar terminado.

# Ao final, responda com um resumo neste formato (para eu colar no Cowork):

```
## O que foi feito
[lista objetiva das mudanças]

## Arquivos/módulos tocados
[lista de arquivos ou áreas do sistema]

## Banco de dados
[nova migration? qual? ou "nenhuma mudança de schema"]

## Testes
[passou / o que foi adicionado ou ajustado]

## Branch
[nome da branch criada, e se já tem PR aberto]

## Pendências ou decisões que ficaram em aberto
[qualquer coisa que precise de decisão minha ou da Fernanda antes do merge]
```
