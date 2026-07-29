# Contexto

Novo módulo discutido no Cowork: **Viveiro de Mudas** (produção de mudas — espécies, lotes de produção acompanhados por fase, estrutura física do viveiro). É o primeiro de 3 prompts que dividem esse módulo (fatiado porque é maior que qualquer módulo existente no sistema):

1. **Este prompt** — cadastros base (Espécies/Cultivares), estrutura física (Viveiro/Setor), Lote de Produção e histórico de Fases.
2. Próximo — insumos/substrato (reaproveitando Estoque), irrigação, fitossanidade, mão de obra por lote.
3. Depois — estoque de mudas prontas, pedido de venda (escopado só pra mudas, não genérico), custos e rastreabilidade/certificação.

Módulo novo, chave `viveiro`, seguindo exatamente o mesmo padrão de multi-tenancy dos outros 11 módulos (ver `docs/ARCHITECTURE.md` e `docs/MODULES.md` neste repo).

Decisões já tomadas na discussão:
- Clientes, Fornecedores e Funcionários **não são recriados** — o módulo usa `Client`, `Supplier` e `Employee` já existentes no Cadastro.
- Insumos/substrato **não são um estoque paralelo** — no próximo prompt, vão usar `StockItem`/`StockBatch` do módulo Estoque (adicionando categoria se necessário).
- "Estoque de mudas prontas" não vira tabela própria — é o próprio Lote filtrado por status/fase (decisão pro prompt 3, mas já deixa a modelagem do Lote preparada pra isso).
- Custos não são armazenados duplicados — no prompt 3, o custeio usa `CostCenter` do Financeiro.
- Estrutura física do viveiro segue o mesmo padrão de `Talhao`/`Pasture`/`Piquete` (ligação opcional a `Property`, campo `boundary Json?` pra eventualmente entrar no editor de mapa que já existe em Talhões/Pastagens/Piquetes — não precisa implementar o editor de mapa neste prompt, só deixar o campo pronto).
- Histórico de fases segue o mesmo padrão de `StallEvent`/`PiqueteEvent` (evento com tipo, data, ligado à entidade principal).

# Tarefa

Antes de começar, crie e mude para uma branch própria a partir da `master` atualizada:

```bash
git checkout master
git pull
git checkout -b feat/viveiro-cadastros-lotes-fases
```

## 1. Schema (`prisma/schema.prisma`)

Adicione os modelos abaixo (nomes e campos são um ponto de partida — ajuste tipos/tamanhos de `Decimal` seguindo o padrão já usado em modelos parecidos do schema, ex: `Talhao`, `Safra`, `StallEvent`):

- **`MudaEspecie`** — nome científico, nome popular, família botânica, cultivar/variedade/clone, tipo de propagação (enum: `SEMENTE`, `ESTACA`, `MUDA_MICROPROPAGADA`, `ENXERTIA`, `ALPORQUIA`, `OUTRO`), ciclo médio até expedição (dias, `Int?`), temperatura ideal, umidade ideal, espaçamento recomendado, ficha técnica/observações (`String?`), fornecedor de material genético (FK opcional pra `Supplier`, já existente). Escopado por `organizationId`.

- **`Viveiro`** — código (único), nome, área (m², `Decimal`), tipo de cobertura (enum: `SOMBRITE`, `PLASTICO`, `CASA_VEGETACAO`, `CEU_ABERTO`, `OUTRO`), percentual de sombrite se aplicável, sistema de irrigação (texto livre por ora), capacidade máxima de bandejas/tubetes (`Int?`), `boundary Json?` (pra eventual editor de mapa, mesmo padrão de `Talhao`), FK opcional pra `Property`. Escopado por `organizationId`.

- **`MudaLote`** (entidade central) — código do lote (único por organização — sugestão de formato `AAAAMMDD-ESPECIE-SEQ`, mas o campo é só `String` livre, a geração do código fica a critério da tela de criação), FK pra `MudaEspecie`, data de semeadura/estaqueamento, origem do propágulo (enum: `SEMENTEIRA_PROPRIA`, `COMPRADO`, `DOADO`) + campo texto pra nº de nota/certificado quando aplicável, quantidade inicial (`Int`), quantidade atual (`Int`, decrementada por baixas — perdas registradas nos eventos de fase), fase atual (enum, ver abaixo — redundante com o último evento de fase mas útil pra filtro rápido sem precisar sempre buscar o último evento), FK pra `Viveiro` (local físico atual), FK opcional pra `Employee` (responsável técnico), substrato (texto livre — não é FK pro Estoque ainda, isso é prompt 2), recipiente (texto: tipo + tamanho), status (enum: `ATIVO`, `DESCARTADO`, `VENDIDO`, `DOADO`, `PERDIDO`), previsão de conclusão (`DateTime?`), notes. Escopado por `organizationId`.

- **`MudaFaseEvento`** — FK pra `MudaLote` (`onDelete: Cascade`, mesmo padrão de `StallEvent`), fase (enum: `SEMEADURA_ESTAQUEAMENTO`, `GERMINACAO_ENRAIZAMENTO`, `REPICAGEM`, `CRESCIMENTO`, `RUSTIFICACAO`, `PRONTA_EXPEDICAO`), data de entrada, data de saída (`DateTime?`, nula enquanto for a fase atual), quantidade perdida nessa fase (`Int?`, default 0), notes. Quando uma nova fase é registrada pra um lote, feche automaticamente a fase anterior (preencha `dataSaida` do evento anterior) — replicar essa lógica na Server Action, não depender só do schema.

Gere a migration com `npx prisma migrate dev` (nunca `db:push`). Rode `npm run db:seed` depois pra confirmar que o seed ainda funciona sem quebrar.

## 2. Registro do módulo

- Adicione a chave `viveiro` em `RETROFITTED_MODULES` (`src/lib/nav.ts`) e um novo `NavGroup` com os itens: Espécies e Cultivares, Estrutura Física (Viveiros), Lotes de Produção.
- Confirme que o módulo aparece disponível pra liberação no painel `/admin` (ele lê de `RETROFITTED_MODULES`) e funciona com `requireModule("viveiro")` do mesmo jeito que os módulos existentes.

## 3. Telas (App Router, dentro de `src/app/(app)/viveiro/`)

- **Espécies e Cultivares** (`/viveiro/especies`) — CRUD simples (listar, criar, editar, ver). Pode seguir o padrão genérico de `src/lib/entities.ts` + `src/lib/crud.ts` + `src/components/crud/` se o formato dessa entidade for compatível (id + campos simples, sem sub-relacionamentos complexos); senão, Server Actions dedicadas seguindo o padrão de um módulo com regra própria (ex: como Hípica faz).
- **Estrutura Física** (`/viveiro/estrutura`) — CRUD de `Viveiro`. Não precisa implementar o editor de mapa agora (isso fica pra quando fizer sentido, o campo `boundary` já existe pronto).
- **Lotes de Produção** (`/viveiro/lotes`) — listagem com filtro por fase/status, criação (gera o lote já com o primeiro evento de fase `SEMEADURA_ESTAQUEAMENTO`), página de detalhe do lote mostrando: dados do lote, timeline de fases (com botão "Avançar fase", que fecha a fase atual e abre a próxima, pedindo quantidade perdida opcional), e taxa de perda calculada por fase e total do ciclo.

## 4. Testes

Adicione testes (Vitest, seguindo o padrão de `src/lib/*.test.ts` já existente) cobrindo pelo menos: cálculo de taxa de perda por fase, e a lógica de fechar a fase anterior ao avançar pra próxima.

# Restrições

- Não commitar direto na `master`.
- Não mexer em `.env`, `.env.example` com segredos reais, nem em `.claude/settings.local.json`.
- Toda mudança de schema via `npx prisma migrate dev` (nunca `db:push` em cima de dado real).
- Seguir os enums em português maiúsculo (`SNAKE_CASE`), no mesmo padrão do resto do `schema.prisma` (ex: `AnimalStatus`, `SafraStatus`).
- Rodar `npm test` e `npm run lint` antes de considerar terminado.
- Não implemente ainda: vínculo com Estoque (insumos/substrato como FK), irrigação, fitossanidade, mão de obra, estoque de mudas prontas, pedido de venda, custos, rastreabilidade/certificação — isso é prompt 2 e 3. Se algo desses for estritamente necessário pra este prompt fazer sentido, pare e me pergunte em vez de implementar por conta própria.

# Ao final, responda com um resumo neste formato (para eu colar no Cowork):

```
## O que foi feito
[lista objetiva das mudanças]

## Modelos criados/alterados no schema
[lista dos models/enums novos, com nome exato usado — pode ter divergido do sugerido aqui]

## Módulo e navegação
[chave do módulo, rotas criadas]

## Banco de dados
[nome da migration gerada]

## Testes
[o que foi adicionado, passou?]

## Branch
[nome da branch, se já tem PR aberto]

## Pendências ou decisões que ficaram em aberto
[qualquer coisa que precise de decisão minha ou da Fernanda antes do merge, ou pro prompt 2]
```
