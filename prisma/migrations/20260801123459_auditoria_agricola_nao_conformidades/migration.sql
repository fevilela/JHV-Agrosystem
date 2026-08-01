-- CreateEnum
CREATE TYPE "AuditoriaTipo" AS ENUM ('INTERNA', 'GLOBALGAP', 'ORGANICO', 'RAINFOREST_ALLIANCE', 'BPA', 'OUTRO');

-- CreateEnum
CREATE TYPE "AuditoriaStatus" AS ENUM ('EM_ANDAMENTO', 'APROVADA', 'REPROVADA', 'PENDENTE_ACAO');

-- CreateEnum
CREATE TYPE "ConformidadeStatus" AS ENUM ('CONFORME', 'NAO_CONFORME', 'NAO_APLICAVEL');

-- CreateEnum
CREATE TYPE "NaoConformidadeOrigem" AS ENUM ('ANALISE_LABORATORIAL', 'AUDITORIA');

-- CreateEnum
CREATE TYPE "NaoConformidadeSeveridade" AS ENUM ('CRITICA', 'MAIOR', 'MENOR');

-- CreateEnum
CREATE TYPE "NaoConformidadeStatus" AS ENUM ('ABERTA', 'EM_TRATATIVA', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "auditorias_agricolas" (
    "id" TEXT NOT NULL,
    "tipo" "AuditoriaTipo" NOT NULL,
    "dataAuditoria" TIMESTAMP(3) NOT NULL,
    "auditorNome" TEXT,
    "checklistNormaReferencia" TEXT,
    "status" "AuditoriaStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "dataReavaliacao" TIMESTAMP(3),
    "certificadoGeradoUrl" TEXT,
    "certificadoValidade" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propriedadeProdutorId" TEXT NOT NULL,

    CONSTRAINT "auditorias_agricolas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_itens" (
    "id" TEXT NOT NULL,
    "auditoriaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "conformidade" "ConformidadeStatus" NOT NULL DEFAULT 'NAO_APLICAVEL',
    "evidenciaUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nao_conformidades" (
    "id" TEXT NOT NULL,
    "origem" "NaoConformidadeOrigem" NOT NULL,
    "descricao" TEXT NOT NULL,
    "severidade" "NaoConformidadeSeveridade" NOT NULL,
    "responsavelInvestigacaoNome" TEXT,
    "causaRaiz" TEXT,
    "acaoCorretivaPreventiva" TEXT,
    "prazoResolucao" TIMESTAMP(3),
    "status" "NaoConformidadeStatus" NOT NULL DEFAULT 'ABERTA',
    "reincidente" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "auditoriaId" TEXT,
    "resultadoId" TEXT,

    CONSTRAINT "nao_conformidades_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auditorias_agricolas" ADD CONSTRAINT "auditorias_agricolas_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias_agricolas" ADD CONSTRAINT "auditorias_agricolas_propriedadeProdutorId_fkey" FOREIGN KEY ("propriedadeProdutorId") REFERENCES "propriedades_produtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_itens" ADD CONSTRAINT "checklist_itens_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "auditorias_agricolas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nao_conformidades" ADD CONSTRAINT "nao_conformidades_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nao_conformidades" ADD CONSTRAINT "nao_conformidades_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "auditorias_agricolas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nao_conformidades" ADD CONSTRAINT "nao_conformidades_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "resultados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

