-- CreateEnum
CREATE TYPE "LaudoStatus" AS ENUM ('RASCUNHO', 'EMITIDO', 'CANCELADO', 'REEMITIDO');

-- CreateEnum
CREATE TYPE "PedidoAnaliseStatusFinanceiro" AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO');

-- AlterTable
ALTER TABLE "metodos_analiticos" ADD COLUMN     "acreditado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "normas_referencia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "limiteLegal" TEXT,
    "dataVigencia" TIMESTAMP(3),
    "versao" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "metodoAnaliticoId" TEXT,

    CONSTRAINT "normas_referencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laudos_tecnicos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "interpretacaoAgronomica" TEXT,
    "recomendacaoCalagemAdubacao" TEXT,
    "templateUtilizado" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "status" "LaudoStatus" NOT NULL DEFAULT 'RASCUNHO',
    "dataValidade" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,
    "responsavelAssinanteId" TEXT NOT NULL,

    CONSTRAINT "laudos_tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laudo_amostras" (
    "id" TEXT NOT NULL,
    "laudoId" TEXT NOT NULL,
    "amostraId" TEXT NOT NULL,

    CONSTRAINT "laudo_amostras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_analise" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2),
    "formaPagamento" TEXT,
    "statusFinanceiro" "PedidoAnaliseStatusFinanceiro" NOT NULL DEFAULT 'PENDENTE',
    "notaFiscalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,

    CONSTRAINT "pedidos_analise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_analise_itens" (
    "id" TEXT NOT NULL,
    "pedidoAnaliseId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2),
    "amostraId" TEXT,

    CONSTRAINT "pedido_analise_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acreditacoes_laboratorio" (
    "id" TEXT NOT NULL,
    "escopoAcreditacao" TEXT,
    "orgaoAcreditador" TEXT,
    "dataValidade" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "acreditacoes_laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acreditacao_auditoria_eventos" (
    "id" TEXT NOT NULL,
    "acreditacaoLaboratorioId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acreditacao_auditoria_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "laudos_tecnicos_organizationId_numero_key" ON "laudos_tecnicos"("organizationId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "laudo_amostras_laudoId_amostraId_key" ON "laudo_amostras"("laudoId", "amostraId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_analise_organizationId_numero_key" ON "pedidos_analise"("organizationId", "numero");

-- AddForeignKey
ALTER TABLE "normas_referencia" ADD CONSTRAINT "normas_referencia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "normas_referencia" ADD CONSTRAINT "normas_referencia_metodoAnaliticoId_fkey" FOREIGN KEY ("metodoAnaliticoId") REFERENCES "metodos_analiticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudos_tecnicos" ADD CONSTRAINT "laudos_tecnicos_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudos_tecnicos" ADD CONSTRAINT "laudos_tecnicos_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "produtores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudos_tecnicos" ADD CONSTRAINT "laudos_tecnicos_responsavelAssinanteId_fkey" FOREIGN KEY ("responsavelAssinanteId") REFERENCES "responsaveis_tecnicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudo_amostras" ADD CONSTRAINT "laudo_amostras_laudoId_fkey" FOREIGN KEY ("laudoId") REFERENCES "laudos_tecnicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudo_amostras" ADD CONSTRAINT "laudo_amostras_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_analise" ADD CONSTRAINT "pedidos_analise_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_analise" ADD CONSTRAINT "pedidos_analise_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "produtores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_analise_itens" ADD CONSTRAINT "pedido_analise_itens_pedidoAnaliseId_fkey" FOREIGN KEY ("pedidoAnaliseId") REFERENCES "pedidos_analise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_analise_itens" ADD CONSTRAINT "pedido_analise_itens_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acreditacoes_laboratorio" ADD CONSTRAINT "acreditacoes_laboratorio_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acreditacao_auditoria_eventos" ADD CONSTRAINT "acreditacao_auditoria_eventos_acreditacaoLaboratorioId_fkey" FOREIGN KEY ("acreditacaoLaboratorioId") REFERENCES "acreditacoes_laboratorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

