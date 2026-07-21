# JHV Agrosystem

Sistema de gestão agropecuária completo: Cadastro, Hípica, Pecuária, Agricultura, Máquinas e Equipamentos, Estoque, Compras, Financeiro, Recursos Humanos e Oficina.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL (Supabase) + NextAuth (Credentials).

## Marca

Paleta navy/azul-aço definida em `src/app/globals.css` (`--color-brand-50` a `--color-brand-900`) e usada em botões, links, foco de formulário, abas e menu ativo — badges de status (ativo/pago/aprovado etc.) permanecem verdes intencionalmente, como cor semântica de "sucesso".

Logo oficial em `public/JHV_logo.png` (completa, usada na tela de login), `public/JHV_icon.png` (só o ícone hexagonal, recortado da logo original para a sidebar) e `src/app/icon.png` (favicon). Os componentes `<Image>` usam a prop `unoptimized` para servir os arquivos direto, sem passar pelo otimizador de imagens do Next.js.

**Causa raiz de um bug de logo "quebrada" já corrigido:** o `matcher` de `src/middleware.ts` cobria qualquer rota, inclusive arquivos estáticos como `/JHV_logo.jpg`. Como a tela de login é vista por usuários **não autenticados**, o próprio pedido da imagem da logo era redirecionado para `/login` pelo middleware (virando HTML em vez de imagem) — por isso a logo aparecia quebrada. O matcher agora exclui extensões de imagem (`png|jpg|jpeg|gif|webp|svg|ico`) explicitamente.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O banco já está configurado em `.env` (`DATABASE_URL`, apontando para o Supabase do projeto).

### Usuário administrador

Criado via seed (`npm run db:seed`):

- **E-mail:** admin@jhvagrosystem.com
- **Senha:** Admin@123

> Troque essa senha assim que possível (ainda não há tela de alteração de senha — pode ser feito diretamente no banco por enquanto).

## Banco de dados

```bash
npx prisma studio          # explorar o banco visualmente
npx prisma migrate dev     # aplicar mudanças no schema
npm run db:seed            # recriar o usuário admin
```

## Mercado Pago (boleto)

Em Financeiro → Contas a Receber, contas com forma de recebimento "Boleto" ganham um botão **Gerar boleto**, que chama a API de Pagamentos do Mercado Pago (`src/lib/mercadopago.ts`) e grava o link/código de barras do boleto na conta. Exige no `.env`:

```
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."   # ou TEST-... para sandbox
```

O cliente precisa ter CPF/CNPJ, e-mail e endereço completo (CEP, rua, número, bairro, cidade, UF) cadastrados — sem isso a geração retorna um erro de validação explicando o que falta.

A baixa automática (marcar como pago quando o boleto é compensado) acontece via webhook em `src/app/api/webhooks/mercadopago`. O Mercado Pago só consegue notificar uma URL pública, então **isso não funciona em `localhost`** — só depois do deploy, com `NEXTAUTH_URL` apontando para o domínio real. Em desenvolvimento, use "Marcar recebido" manualmente.

### Cobranças recorrentes e juros por atraso

Em Financeiro → Cobranças Recorrentes, um template (cliente, descrição, valor, dia do mês) faz o sistema criar automaticamente a conta a receber e gerar o boleto todo mês. Isso é disparado por um job diário em `.github/workflows/faturamento-diario.yml`, que chama `POST /api/cron/faturamento` (protegido pelo header `x-cron-secret`, comparado à variável `CRON_SECRET`).

A mesma rotina reemite automaticamente o boleto de contas em atraso com o valor corrigido (2% de multa + 1% ao mês de juros, proporcional aos dias de atraso) — a API de Pagamentos do Mercado Pago não permite embutir juros/multa no boleto original (isso só existe na ferramenta manual "Começar a cobrar" do app do Mercado Pago), então a forma de refletir o valor atualizado é cancelar o boleto anterior e emitir um novo. Por isso, durante o atraso, sempre use o link mais recente em "Ver boleto".

Para funcionar em produção, configure:
- No Render (variáveis de ambiente do serviço): `CRON_SECRET` (mesmo valor usado no GitHub).
- No GitHub (Settings → Secrets and variables → Actions do repositório): secret `CRON_SECRET` e variable `APP_URL` (ex: `https://jhv-agrosystem.onrender.com`).

### Envio automático do boleto por WhatsApp

Toda vez que um boleto é gerado ou reemitido (manual, recorrente ou por atraso), `src/lib/whatsapp.ts` tenta enviar o link para o cliente via WhatsApp Business Platform (API oficial da Meta), usando o telefone cadastrado no cliente. É best-effort: se falhar (token ausente, telefone inválido, modelo não aprovado etc.), só loga o erro e não impede a geração do boleto.

Exige no `.env`:
```
WHATSAPP_ACCESS_TOKEN="..."          # token permanente de Usuário do Sistema no Meta Business
WHATSAPP_PHONE_NUMBER_ID="..."       # Phone Number ID do número comercial no WhatsApp Business Platform
WHATSAPP_TEMPLATE_NAME="notificacao_boleto"
```

O modelo de mensagem (`notificacao_boleto`, categoria Utilidade) precisa estar aprovado no Meta Business Manager com 5 variáveis de corpo, nesta ordem: nome do cliente, descrição da conta, valor formatado, vencimento formatado, link do boleto. Sem credenciais configuradas (nem via `.env`, nem via a conexão abaixo), o envio fica silenciosamente desativado.

### Conectar WhatsApp dedicado ao sistema (Configurações → Conectar WhatsApp)

A tela `/configuracoes/whatsapp` conecta um número de WhatsApp Business colando um **Token de Acesso Permanente de Usuário do Sistema** (System User) — não um fluxo de login em popup. Tentamos primeiro o Embedded Signup (login self-service via `FB.login()`), mas ele nunca completou a etapa de conectar o número de forma confiável (várias sessões de troubleshooting sem sucesso, mesmo com toda a configuração da Meta aparentemente correta); o token manual é o mesmo padrão já usado pro Mercado Pago e é bem mais previsível.

Passo a passo pra gerar o token (feito uma vez por organização, no Gerenciador de Negócios da própria organização dona do número):
1. `business.facebook.com` → Configurações do Negócio → Usuários → Usuários do sistema → Adicionar (função Admin).
2. Selecionar o usuário do sistema → Adicionar ativos → escolher a Conta do WhatsApp Business (WABA) → conceder controle total.
3. Gerar novo token → selecionar o App usado pra essa integração → marcar `whatsapp_business_messaging` e `whatsapp_business_management` → gerar.
4. Colar o token (só aparece uma vez) e o **Phone Number ID** (achado em WhatsApp Manager → Configuração da API → Números de telefone) na tela `/configuracoes/whatsapp`.

O formulário valida o token direto contra a API da Meta antes de salvar (`GET /{phone_number_id}?fields=verified_name`), então token/ID errados retornam erro na hora em vez de salvar algo quebrado. O resultado fica salvo na tabela `WhatsappConnection`; `src/lib/whatsapp.ts` sempre prioriza essa conexão do banco antes de cair para as variáveis de ambiente.

### Conversas do WhatsApp (Configurações → Conversas WhatsApp)

Além do envio automático de boleto, o sistema recebe e guarda as mensagens trocadas pelo número conectado — modelo `WhatsappMessage`, associado por telefone ao `Client` quando bate. O webhook em `src/app/api/webhooks/whatsapp/route.ts` processa `messages` (mensagens recebidas, casadas ao cliente pelo telefone) e `statuses` (atualização de entrega/leitura das mensagens enviadas). A tela `/configuracoes/whatsapp/conversas` lista as conversas e permite responder em texto livre — a Meta só aceita texto livre até 24h depois da última mensagem do cliente; fora disso, é preciso um modelo aprovado (como o de boleto).

### Envio de contrato por WhatsApp e e-mail

Na página de um contrato (`/hipica/contratos/[id]`) há botões "Enviar por E-mail" e "Enviar por WhatsApp", além de "Baixar PDF". O e-mail (via Resend, configurado por organização em Configurações → Empresa) anexa o PDF direto. O WhatsApp não anexa arquivo — envia um modelo de mensagem com um link para `/contrato-publico/[id]/pdf`, uma rota pública (sem login) que serve o PDF do contrato, protegida só pelo id do contrato ser um cuid não adivinhável (mesmo padrão de segurança do link do boleto do Mercado Pago).

Assim como o boleto, o envio por WhatsApp exige um modelo aprovado no Meta Business Manager: `notificacao_contrato` (categoria Utilidade), com 3 variáveis de corpo, nesta ordem: nome do cliente, descrição do contrato, link do contrato. Sem esse modelo aprovado (ou sem WhatsApp conectado), o envio falha com uma mensagem de erro explicando o motivo.

## Contabilidade (partida dobrada)

Módulo de contabilidade formal em `/contabilidade`: Plano de Contas (hierárquico, com um plano padrão já semeado via `npm run db:seed` — Ativo/Passivo/PL/Receitas/Custos/Despesas adaptado ao agro), Lançamentos Contábeis (partidas de débito/crédito que precisam fechar — validado no cliente e no servidor), Livro Razão, Balancete de Verificação, Balanço Patrimonial e DRE.

**Importante:** isso é a infraestrutura de escrituração (os números certos, calculados certo), não substitui um contador. A legislação brasileira exige que o fechamento oficial (balanço, SPED/ECD/ECF, obrigações fiscais) seja assinado por um contador registrado no CRC. O Balanço Patrimonial deste sistema mostra só Ativo/Passivo/PL — pra ele fechar exatamente com o Ativo, o resultado apurado na DRE do período precisa ser lançado manualmente em "Lucros/Prejuízos Acumulados" no encerramento do exercício (trabalho tipicamente feito com o contador).

## Status dos módulos

- **Cadastro** — completo: Proprietários, Animais/Cavalos (com genealogia, fotos e documentos), Funcionários, Veterinários, Ferradores, Instrutores, Tratadores, Clientes, Fornecedores.
- **Hípica** — completo: Controle Diário/Treinamento, Nutrição, Sanidade (medicamento/vacina/soro/vermífugo/ferradura/casqueamento, com próxima dose), Baia (com ocupação e histórico), Agenda, Competições, Transporte, Financeiro da Hípica, Compra e Venda de Animais. A ficha de cada animal tem abas de Saúde (registros de sanidade) e Histórico (linha do tempo unificada com sanidade, treinos, dieta, baia, agenda, competições e transações).
- **Pecuária** — completo: Cadastro Animal (brinco/RFID/lote/pasto), Reprodução (IA/monta natural/diagnóstico/parição), Sanidade (vacinas/vermífugos/tratamentos), Pesagens (com cálculo automático de GMD), Pastagens (com lotação calculada), Nutrição/Confinamento por lote, Manejo (+ Lotes), Produção de Leite (CCS/CBT).
- **Agricultura** — completo: Talhões, Planejamento de Safra (com status sincronizado automaticamente ao colher), Plantio, Tratos Culturais (adubação/pulverização/herbicidas/inseticidas/fungicidas), Fertilidade (análise de solo/calagem/gessagem), Irrigação, Colheita, Armazenagem (silos/armazéns com estoque calculado por movimentações de entrada/saída/quebra).
- **Máquinas e Equipamentos** — completo: Cadastro (tratores, colheitadeiras, pulverizadores, caminhões, implementos, carretas), Controle de Uso (horímetro sincronizado automaticamente, combustível, operador, talhão), Manutenções (preventiva/corretiva/troca de óleo/pneu/lubrificação, com alerta visual de manutenção próxima/atrasada).
- **Estoque** — completo: Materiais e Insumos (medicamentos/insumos/rações/ferramentas/peças/combustível/EPI, com código de barras e alerta de estoque mínimo), Lotes e Validade (entrada e consumo de lotes sincronizam o estoque automaticamente, com alerta visual de validade próxima/vencida).
- **Compras** — completo: Solicitações (com aprovação/rejeição rápida), Cotações (por fornecedor, vinculáveis a uma solicitação), Pedidos (nota fiscal, entrega prevista/real, marcação rápida de entregue) — fluxo completo solicitação → cotação → pedido testado ponta a ponta.
- **Financeiro** — completo: Centro de Custos, Contas a Pagar e Contas a Receber (com forma de pagamento PIX/boleto/cartão/cheque, marcação rápida de pago/recebido, status "atrasado" calculado automaticamente, emissão de boleto real via Mercado Pago com baixa automática por webhook), Cobranças Recorrentes (mensalidades automáticas com reemissão de boleto e juros por atraso), Fluxo de Caixa (saldo atual, saldo projetado, e saldo acumulado por movimentação realizada).
- **Recursos Humanos** — completo: Funcionários (redireciona para o cadastro em Cadastro), Ponto e Escalas (presença/falta/atestado/férias + escalas por turno), Treinamentos e EPIs (com alerta visual de validade próxima/vencida).
- **Oficina** — completo: Ordens de Serviço (vinculadas a máquina e mecânico, com peças que decrementam o estoque automaticamente e custo total calculado), Peças e Mecânicos (CRUD de mecânicos + visão de peças reaproveitando o Estoque).

**Todos os 11 módulos do sistema estão implementados e testados.**

## Uploads

Fotos e documentos de animais são salvos em `public/uploads/` (fora do controle de versão). Em produção isso deve migrar para um storage externo (ex: S3, Supabase Storage).
