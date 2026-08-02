# Módulos

O sistema tem 13 chaves de módulo (constante `RETROFITTED_MODULES` + `cadastro`, em `src/lib/nav.ts`), controladas por `Organization.allowedModules` e `User.allowedModules` (ver [ARCHITECTURE.md](./ARCHITECTURE.md#multi-tenancy-organizações)). `cadastro` e `configuracoes` ficam sempre visíveis, independente de liberação.

## Cadastro (`cadastro`)

Base compartilhada por todos os outros módulos. Rotas em `/cadastro/*`: Propriedades, Proprietários, Animais/Cavalos (genealogia, fotos, documentos), Funcionários, Veterinários, Ferradores, Instrutores, Tratadores, Clientes, Fornecedores.

## Hípica (`hipica`)

Rotas em `/hipica/*`: Controle Diário/Treinamento, Nutrição, Sanidade (medicamento/vacina/soro/vermífugo/ferradura/casqueamento com próxima dose), Baia, Piquetes, Agenda, Competições, Transporte, Financeiro da Hípica, Compra e Venda de Animais, Contratos (aulas/piquete/baia, com boleto e envio automático). A ficha do animal tem abas de Saúde e Histórico (linha do tempo unificada).

## Pecuária (`pecuaria`)

Rotas em `/pecuaria/*`: Cadastro Animal (brinco/RFID/lote/pasto), Reprodução (IA/monta natural/diagnóstico/parição), Sanidade, Pesagens (GMD automático), Pastagens (lotação calculada), Nutrição/Confinamento por lote, Manejo, Produção de Leite (CCS/CBT).

## Agricultura (`agricultura`)

Rotas em `/agricultura/*`: Talhões, Planejamento de Safra (status sincronizado ao colher), Plantio, Tratos Culturais, Fertilidade, Irrigação, Colheita, Armazenagem (estoque de silo/armazém calculado por movimentações).

## Máquinas e Equipamentos (`maquinas`)

Rotas em `/maquinas/*`: Cadastro, Controle de Uso (horímetro sincronizado automaticamente, combustível, operador, talhão), Manutenções (com alerta de manutenção próxima/atrasada).

## Estoque (`estoque`)

Rotas em `/estoque/*`: Materiais e Insumos (código de barras, estoque mínimo), Lotes e Validade (entrada/consumo sincroniza estoque, alerta de validade próxima/vencida).

## Compras (`compras`)

Rotas em `/compras/*`: Solicitações (aprovação/rejeição), Cotações (por fornecedor), Pedidos (nota fiscal, entrega). Fluxo solicitação → cotação → pedido.

## Financeiro (`financeiro`)

Rotas em `/financeiro/*`: Centro de Custos, Contas a Pagar/Receber (PIX/boleto/cartão/cheque, boleto real via Mercado Pago com baixa automática), Cobranças Recorrentes (mensalidades com reemissão de boleto e juros por atraso), Fluxo de Caixa.

## Contabilidade (`contabilidade`)

Rotas em `/contabilidade/*`: Plano de Contas (hierárquico), Lançamentos Contábeis (débito/crédito, validado em ambos os lados), Livro Razão, Balancete de Verificação, Balanço Patrimonial, DRE. É infraestrutura de escrituração — não substitui contador; fechamento oficial (SPED/ECD/ECF) segue sendo trabalho de contador registrado no CRC.

## Recursos Humanos (`rh`)

Rotas em `/rh/*`: Funcionários (redireciona pro cadastro), Ponto e Escalas, Treinamentos e EPIs (alerta de validade).

## Oficina (`oficina`)

Rotas em `/oficina/*`: Ordens de Serviço (vinculadas a máquina e mecânico, peças decrementam estoque automaticamente), Peças e Mecânicos.

## Viveiro de Mudas (`viveiro`)

Rotas em `/viveiro/*`: Espécies e Cultivares (`/viveiro/especies`), Estrutura Física (`/viveiro/estrutura` — viveiros/setores, com campo pronto pro editor de mapa mas ainda sem UI de mapa), Lotes de Produção (`/viveiro/lotes` — com histórico de fases de produção, cálculo de taxa de perda por fase, e um filtro "Disponíveis pra Venda" pros lotes na fase `PRONTA_EXPEDICAO` com quantidade em estoque), Pedidos de Venda (`/viveiro/pedidos`). Reaproveita `Client`/`Supplier`/`Employee` do Cadastro; não duplica nada do Estoque ou Financeiro.

Na página de detalhe de um lote (`/viveiro/lotes/[id]`), abas adicionais registram, por lote: Insumos consumidos (decrementa `StockItem.currentQuantity` do Estoque, mesmo padrão de `ServiceOrderPart`/Oficina — não deixa o estoque ficar negativo), Irrigação, Fitossanidade (praga/doença/tratamento preventivo), Mão de Obra apontada e Certificados (documentos anexados via Supabase Storage, mesmo padrão de `AnimalDocument`). `unitCost` (insumo) e `custoHora` (mão de obra) ficam gravados no momento do lançamento e alimentam o card de custo do lote (custo total e custo por muda, calculado sobre `quantidadeInicial` — sinaliza quando o custo está incompleto por faltar algum valor lançado).

Pedido de Venda (`MudaPedidoVenda`/`MudaPedidoVendaItem`, mesmo padrão de header+itens de `PedidoAnalise`) só aceita itens de lotes na fase `PRONTA_EXPEDICAO`. Confirmar o pedido decrementa `MudaLote.quantidadeAtual` de cada lote envolvido (validando que a quantidade pedida ainda cabe no estoque do lote); cancelar um pedido confirmado reverte a baixa.

Cada lote tem um botão "Baixar PDF de Rastreabilidade" (`/viveiro/lotes/[id]/rastreabilidade/pdf`, autenticado) que reúne espécie/cultivar, viveiro, histórico de fases, insumos, irrigação, fitossanidade, mão de obra e os pedidos/clientes pra quem foi vendido — documento único de origem do lote, reaproveitando `@react-pdf/renderer` como o contrato da Hípica já faz.

## Configurações (`configuracoes`)

Sempre visível. Rotas em `/configuracoes/*`: Dados da Empresa, Conectar WhatsApp, Conversas WhatsApp, Log de Auditoria, API pública. Ver integrações no [README](../README.md).

## Painel super admin (`/admin`)

Fora dos módulos acima — só para `User.isSuperAdmin`. Cria/edita organizações (incluindo quais módulos cada uma libera) e usuários dentro delas. Ver `requireSuperAdmin()` em [ARCHITECTURE.md](./ARCHITECTURE.md).

---

Para detalhes de negócio e integrações (Mercado Pago, WhatsApp, contabilidade), ver o [README](../README.md). Para os modelos de dados por trás de cada módulo, ver [DATABASE.md](./DATABASE.md).
