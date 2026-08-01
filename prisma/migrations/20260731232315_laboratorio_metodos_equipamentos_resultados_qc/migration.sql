-- CreateEnum
CREATE TYPE "EquipamentoStatus" AS ENUM ('EM_USO', 'MANUTENCAO', 'FORA_OPERACAO');

-- CreateEnum
CREATE TYPE "ResultadoStatus" AS ENUM ('PENDENTE', 'VALIDADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "ControleQualidadeTipo" AS ENUM ('BRANCO', 'DUPLICATA', 'PADRAO_REFERENCIA_CRM', 'OUTRO');

-- CreateEnum
CREATE TYPE "ControleQualidadeResultado" AS ENUM ('DENTRO_FAIXA', 'FORA_FAIXA');

-- AlterEnum
ALTER TYPE "StockCategory" ADD VALUE 'REAGENTE';

-- CreateTable
CREATE TABLE "metodos_analiticos" (
    "id" TEXT NOT NULL,
    "nomeParametro" TEXT NOT NULL,
    "referenciaNormativa" TEXT,
    "unidadeMedida" TEXT,
    "faixaDeteccaoMin" DECIMAL(12,4),
    "faixaDeteccaoMax" DECIMAL(12,4),
    "incertezaMedicao" DECIMAL(12,4),
    "tempoMedioAnaliseDias" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "metodos_analiticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos_lab" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "dataUltimaCalibracao" TIMESTAMP(3),
    "dataProximaCalibracao" TIMESTAMP(3),
    "certificadoCalibracaoUrl" TEXT,
    "responsavelCalibracao" TEXT,
    "status" "EquipamentoStatus" NOT NULL DEFAULT 'EM_USO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "equipamentos_lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamento_manutencoes" (
    "id" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "responsavel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipamento_manutencoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(14,4) NOT NULL,
    "dataAnalise" TIMESTAMP(3) NOT NULL,
    "repeticoes" INTEGER,
    "status" "ResultadoStatus" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "amostraId" TEXT NOT NULL,
    "metodoAnaliticoId" TEXT NOT NULL,
    "analistaId" TEXT,
    "equipamentoId" TEXT,
    "loteReagenteId" TEXT,

    CONSTRAINT "resultados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controles_qualidade" (
    "id" TEXT NOT NULL,
    "tipo" "ControleQualidadeTipo" NOT NULL,
    "valorObtido" DECIMAL(14,4),
    "faixaAceitavelMin" DECIMAL(14,4),
    "faixaAceitavelMax" DECIMAL(14,4),
    "resultadoControle" "ControleQualidadeResultado" NOT NULL,
    "acaoCorretiva" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "resultadoId" TEXT NOT NULL,

    CONSTRAINT "controles_qualidade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "metodos_analiticos" ADD CONSTRAINT "metodos_analiticos_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos_lab" ADD CONSTRAINT "equipamentos_lab_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento_manutencoes" ADD CONSTRAINT "equipamento_manutencoes_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos_lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_metodoAnaliticoId_fkey" FOREIGN KEY ("metodoAnaliticoId") REFERENCES "metodos_analiticos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos_lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_loteReagenteId_fkey" FOREIGN KEY ("loteReagenteId") REFERENCES "stock_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controles_qualidade" ADD CONSTRAINT "controles_qualidade_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controles_qualidade" ADD CONSTRAINT "controles_qualidade_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "resultados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

