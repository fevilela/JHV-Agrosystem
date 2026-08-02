# Contexto

Terceira e última fase planejada do módulo Viveiro de Mudas (ver `docs/MODULES.md`), depois da
fase 1 (espécies/estrutura/lotes) e fase 2 (insumos, irrigação, fitossanidade, mão de obra —
`PROMPT_007_viveiro-fase-2.md`, que deve ser implementado e mergeado antes deste, já que os campos
`MudaLoteInsumo.unitCost` e `MudaLoteMaoDeObra.custoHora` da fase 2 são a base do cálculo de custo
pedido aqui). Se a fase 2 ainda não estiver na `master` quando for começar, pare e confirme comigo
antes de prosseguir.

Escopo desta fase: estoque de mudas prontas pra venda, pedido de venda pro cliente, cálculo de
custo por lote, e rastreabilidade/certificação.

Padrão de "pedido com itens" já usado no projeto (seguir o mesmo formato em vez de inventar um
novo): `PedidoAnalise`/`PedidoAnaliseItem` (Laboratório Agrícola, ver `prisma/schema.prisma`) —
header com número sequencial por organização + status, e itens filhos com `onDelete: Cascade`
apontando pro header.

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b feature/viveiro-fase-3
```

# Tarefa

## 1. Estoque de mudas prontas

Não precisa de model novo pra isso — um `MudaLote` já é "estoque disponível" quando
`faseAtual == PRONTA_EXPEDICAO` e `quantidadeAtual > 0`. Adicionar uma visão/relatório (pode ser
uma nova rota `/viveiro/lotes` com filtro, ou uma seção separada — decida o que for mais natural
olhando a listagem atual de lotes) mostrando só os lotes nessa condição, como "disponível pra
venda".

## 2. Pedido de venda

Novos models no `prisma/schema.prisma`, seguindo o padrão `PedidoAnalise`/`PedidoAnaliseItem`:

- **`MudaPedidoVenda`**: `numero` (único por organização, mesmo padrão de
  `@@unique([organizationId, numero])`), `clienteId` (`Client`, já existe em Cadastro),
  `dataPedido` (default `now()`), `status` (enum `MudaPedidoVendaStatus`: `PENDENTE`,
  `CONFIRMADO`, `ENTREGUE`, `CANCELADO`), `valorTotal?` (`Decimal? @db.Decimal(12,2)`), `notes?`,
  `organizationId`, `createdAt`/`updatedAt`.
- **`MudaPedidoVendaItem`**: `pedidoId` (→ `MudaPedidoVenda`, `onDelete: Cascade`), `loteId`
  (→ `MudaLote`), `quantidade` (`Int`), `precoUnitario` (`Decimal @db.Decimal(10,2)`).

Regras de negócio (replicar em `src/lib/` com teste, seguindo o padrão de `src/lib/muda-lote.ts`):

- Só permitir adicionar item com `lote.faseAtual === "PRONTA_EXPEDICAO"`.
- Ao confirmar o pedido (status vai pra `CONFIRMADO`), em `$transaction`: validar que
  `quantidade <= lote.quantidadeAtual` pra cada item (senão erro), decrementar
  `MudaLote.quantidadeAtual` de cada lote envolvido. Ao cancelar um pedido já confirmado,
  reverter (incrementar de volta) — mesmo espírito do padrão de reversão já usado em
  `ServiceOrderPart`/Oficina.
- `valorTotal` do pedido é a soma de `quantidade * precoUnitario` dos itens — calcular ao
  salvar, não deixar o usuário digitar direto (evita inconsistência).

Gerar a migration com `npx prisma migrate dev --name viveiro_fase_3_pedido_venda`.

UI: nova seção/rota em `/viveiro/pedidos` (listagem + criação + detalhe com itens), seguindo o
mesmo estilo visual e de `actions.ts` já usado nas outras rotas do Viveiro.

## 3. Custo por lote

Em `src/lib/muda-lote.ts` (já existe, tem teste em `muda-lote.test.ts` — seguir o mesmo estilo),
adicionar uma função de cálculo de custo por lote, agregando:

- `sum(MudaLoteInsumo.quantidade * unitCost)` dos insumos consumidos nesse lote (fase 2).
- `sum(MudaLoteMaoDeObra.horasTrabalhadas * custoHora)` da mão de obra apontada nesse lote (fase 2).

Exibir na página de detalhe do lote (`/viveiro/lotes/[id]`): custo total do lote e custo por muda
(`custoTotal / quantidadeInicial` — usar `quantidadeInicial`, não `quantidadeAtual`, pra não
distorcer o custo unitário conforme perdas/vendas vão acontecendo). Se algum `unitCost`/`custoHora`
estiver nulo (lançamento antigo sem custo informado), deixar claro na UI que o custo é parcial/
incompleto em vez de tratar como zero silenciosamente.

## 4. Rastreabilidade / certificação

`MudaLote` já tem `numeroNotaCertificado` (fase 1). Adicionar:

- Anexo de documento de certificação por lote — reusar `saveUploadedFile`/Supabase Storage (ver
  `PROMPT_006_uploads-supabase-storage.md`, que deve estar mergeado antes deste; se não estiver,
  pare e confirme comigo) no mesmo padrão de `AnimalDocument`. Pode ser um model novo
  (`MudaLoteCertificado`: `loteId`, `url`, `nome`, `emitidoEm?`, `notes?`) ou reaproveitar um
  padrão existente se fizer mais sentido — decida olhando o código.
- Relatório de rastreabilidade do lote: uma página ou exportação (PDF, reusando
  `@react-pdf/renderer` como `src/lib/contract-pdf.tsx` já faz) reunindo, pra um lote específico:
  espécie/cultivar, viveiro, datas e histórico de fases (`MudaFaseEvento`), insumos consumidos,
  eventos de irrigação e fitossanidade, mão de obra, e pra qual(is) pedido(s)/cliente(s) foi
  vendido. Objetivo é ter um documento único que mostre a origem completa do lote se um cliente
  pedir certificação/rastreabilidade.

## 5. Documentação

Atualizar `docs/MODULES.md` (Viveiro de Mudas deixa de ter fases pendentes) e `docs/DATABASE.md`
(tabela de modelos por módulo, adicionar `MudaPedidoVenda`, `MudaPedidoVendaItem` e o model de
certificado que decidir usar).

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example`, nem em `.claude/settings.local.json`.
- Gerar a migration com `npx prisma migrate dev` (nunca `db:push` em cima de dado real).
- Nunca aponte comandos de diff/resolve do Prisma (`--shadow-database-url` ou similar) para o
  `DATABASE_URL` real — ver `docs/DATABASE.md` sobre o incidente anterior. Se encontrar drift, pare
  e pergunte antes de corrigir.
- Não deixar `MudaLote.quantidadeAtual` ficar negativo em nenhum fluxo.
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
[qualquer coisa que precise de decisão minha ou da Fernanda antes do merge — em especial, se a
fase 2 (PROMPT_007) ou o PROMPT_006 (uploads) não estavam mergeados e isso bloqueou parte do
trabalho]
```
