# JHV Agrosystem

Sistema de gestão agropecuária completo: Cadastro, Hípica, Pecuária, Agricultura, Máquinas e Equipamentos, Estoque, Compras, Financeiro, Recursos Humanos e Oficina.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL (Supabase) + NextAuth (Credentials).

## Marca

Paleta navy/azul-aço definida em `src/app/globals.css` (`--color-brand-50` a `--color-brand-900`) e usada em botões, links, foco de formulário, abas e menu ativo — badges de status (ativo/pago/aprovado etc.) permanecem verdes intencionalmente, como cor semântica de "sucesso".

Logo oficial em `public/JHV_logo.jpg` (completa, usada na tela de login), `public/JHV_icon.png` (só o ícone hexagonal, recortado da logo original para a sidebar) e `src/app/icon.png` (favicon). Os componentes `<Image>` usam a prop `unoptimized` para servir os arquivos direto, sem passar pelo otimizador de imagens do Next.js.

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

## Status dos módulos

- **Cadastro** — completo: Proprietários, Animais/Cavalos (com genealogia, fotos e documentos), Funcionários, Veterinários, Ferradores, Instrutores, Tratadores, Clientes, Fornecedores.
- **Hípica** — completo: Controle Diário/Treinamento, Nutrição, Baia (com ocupação e histórico), Agenda, Competições, Transporte, Financeiro da Hípica, Compra e Venda de Animais.
- **Pecuária** — completo: Cadastro Animal (brinco/RFID/lote/pasto), Reprodução (IA/monta natural/diagnóstico/parição), Sanidade (vacinas/vermífugos/tratamentos), Pesagens (com cálculo automático de GMD), Pastagens (com lotação calculada), Nutrição/Confinamento por lote, Manejo (+ Lotes), Produção de Leite (CCS/CBT).
- **Agricultura** — completo: Talhões, Planejamento de Safra (com status sincronizado automaticamente ao colher), Plantio, Tratos Culturais (adubação/pulverização/herbicidas/inseticidas/fungicidas), Fertilidade (análise de solo/calagem/gessagem), Irrigação, Colheita, Armazenagem (silos/armazéns com estoque calculado por movimentações de entrada/saída/quebra).
- **Máquinas e Equipamentos** — completo: Cadastro (tratores, colheitadeiras, pulverizadores, caminhões, implementos, carretas), Controle de Uso (horímetro sincronizado automaticamente, combustível, operador, talhão), Manutenções (preventiva/corretiva/troca de óleo/pneu/lubrificação, com alerta visual de manutenção próxima/atrasada).
- **Estoque** — completo: Materiais e Insumos (medicamentos/insumos/rações/ferramentas/peças/combustível/EPI, com código de barras e alerta de estoque mínimo), Lotes e Validade (entrada e consumo de lotes sincronizam o estoque automaticamente, com alerta visual de validade próxima/vencida).
- **Compras** — completo: Solicitações (com aprovação/rejeição rápida), Cotações (por fornecedor, vinculáveis a uma solicitação), Pedidos (nota fiscal, entrega prevista/real, marcação rápida de entregue) — fluxo completo solicitação → cotação → pedido testado ponta a ponta.
- **Financeiro** — completo: Centro de Custos, Contas a Pagar e Contas a Receber (com forma de pagamento PIX/boleto/cartão/cheque, marcação rápida de pago/recebido, status "atrasado" calculado automaticamente, emissão de boleto real via Mercado Pago com baixa automática por webhook), Fluxo de Caixa (saldo atual, saldo projetado, e saldo acumulado por movimentação realizada).
- **Recursos Humanos** — completo: Funcionários (redireciona para o cadastro em Cadastro), Ponto e Escalas (presença/falta/atestado/férias + escalas por turno), Treinamentos e EPIs (com alerta visual de validade próxima/vencida).
- **Oficina** — completo: Ordens de Serviço (vinculadas a máquina e mecânico, com peças que decrementam o estoque automaticamente e custo total calculado), Peças e Mecânicos (CRUD de mecânicos + visão de peças reaproveitando o Estoque).

**Todos os 11 módulos do sistema estão implementados e testados.**

## Uploads

Fotos e documentos de animais são salvos em `public/uploads/` (fora do controle de versão). Em produção isso deve migrar para um storage externo (ex: S3, Supabase Storage).
