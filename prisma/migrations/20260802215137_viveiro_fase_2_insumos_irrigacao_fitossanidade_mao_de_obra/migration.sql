-- CreateEnum
CREATE TYPE "MudaFitossanidadeTipo" AS ENUM ('PRAGA', 'DOENCA', 'TRATAMENTO_PREVENTIVO');

-- CreateTable
CREATE TABLE "muda_lote_insumos" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "muda_lote_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muda_lote_irrigacoes" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" TEXT,
    "duracaoMinutos" INTEGER,
    "responsavelId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "muda_lote_irrigacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muda_lote_fitossanidades" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "MudaFitossanidadeTipo" NOT NULL,
    "produtoAplicado" TEXT,
    "dosagem" TEXT,
    "responsavelId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "muda_lote_fitossanidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muda_lote_mao_de_obras" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atividade" TEXT NOT NULL,
    "horasTrabalhadas" DECIMAL(5,2) NOT NULL,
    "custoHora" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "muda_lote_mao_de_obras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "muda_lote_insumos" ADD CONSTRAINT "muda_lote_insumos_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_insumos" ADD CONSTRAINT "muda_lote_insumos_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_insumos" ADD CONSTRAINT "muda_lote_insumos_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_irrigacoes" ADD CONSTRAINT "muda_lote_irrigacoes_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_irrigacoes" ADD CONSTRAINT "muda_lote_irrigacoes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_irrigacoes" ADD CONSTRAINT "muda_lote_irrigacoes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_fitossanidades" ADD CONSTRAINT "muda_lote_fitossanidades_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_fitossanidades" ADD CONSTRAINT "muda_lote_fitossanidades_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_fitossanidades" ADD CONSTRAINT "muda_lote_fitossanidades_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_mao_de_obras" ADD CONSTRAINT "muda_lote_mao_de_obras_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_mao_de_obras" ADD CONSTRAINT "muda_lote_mao_de_obras_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_mao_de_obras" ADD CONSTRAINT "muda_lote_mao_de_obras_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
