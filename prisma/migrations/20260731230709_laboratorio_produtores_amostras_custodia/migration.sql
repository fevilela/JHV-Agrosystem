-- CreateEnum
CREATE TYPE "ProdutorTipo" AS ENUM ('PRODUTOR_RURAL', 'COOPERATIVA', 'EMPRESA', 'CONSULTOR_AGRONOMICO');

-- CreateEnum
CREATE TYPE "RegistroProfissionalTipo" AS ENUM ('CREA', 'CRQ', 'OUTRO');

-- CreateEnum
CREATE TYPE "AmostraTipo" AS ENUM ('SOLO', 'FOLHA', 'AGUA', 'ADUBO', 'SEMENTE', 'TECIDO_VEGETAL', 'RESIDUO');

-- CreateEnum
CREATE TYPE "CondicaoRecebimento" AS ENUM ('INTEGRA', 'VIOLADA', 'REFRIGERADA', 'OUTRO');

-- CreateEnum
CREATE TYPE "AmostraStatus" AS ENUM ('RECEBIDA', 'EM_ANALISE', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "CustodiaLocal" AS ENUM ('RECEPCAO', 'SETOR_ANALISE', 'ARQUIVO', 'OUTRO');

-- CreateTable
CREATE TABLE "produtores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "tipo" "ProdutorTipo" NOT NULL DEFAULT 'PRODUTOR_RURAL',
    "inscricaoEstadual" TEXT,
    "numeroProdutorRural" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "responsavelTecnicoNome" TEXT,
    "responsavelTecnicoCrea" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "produtores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propriedades_produtor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "areaTotalHa" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,

    CONSTRAINT "propriedades_produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talhoes_produtor" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "areaHa" DECIMAL(10,2),
    "culturaImplantada" TEXT,
    "tipoSolo" TEXT,
    "historicoUso" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propriedadeProdutorId" TEXT NOT NULL,

    CONSTRAINT "talhoes_produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsaveis_tecnicos" (
    "id" TEXT NOT NULL,
    "registroProfissional" TEXT NOT NULL,
    "tipoRegistro" "RegistroProfissionalTipo" NOT NULL DEFAULT 'CREA',
    "setor" TEXT,
    "assinaturaDigitalRef" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "responsaveis_tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amostras" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tipo" "AmostraTipo" NOT NULL,
    "dataColeta" TIMESTAMP(3) NOT NULL,
    "profundidadeColeta" TEXT,
    "responsavelColetaNome" TEXT,
    "metodoColeta" TEXT,
    "dataRecebimento" TIMESTAMP(3),
    "condicaoRecebimento" "CondicaoRecebimento",
    "numeroSubAmostras" INTEGER,
    "status" "AmostraStatus" NOT NULL DEFAULT 'RECEBIDA',
    "prazoEntregaPrevisto" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propriedadeProdutorId" TEXT NOT NULL,
    "talhaoProdutorId" TEXT,

    CONSTRAINT "amostras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cadeia_custodia_eventos" (
    "id" TEXT NOT NULL,
    "amostraId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelMovimentacao" TEXT,
    "local" "CustodiaLocal" NOT NULL DEFAULT 'RECEPCAO',
    "temperaturaArmazenamento" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cadeia_custodia_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_tecnicos_employeeId_key" ON "responsaveis_tecnicos"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "amostras_organizationId_code_key" ON "amostras"("organizationId", "code");

-- AddForeignKey
ALTER TABLE "produtores" ADD CONSTRAINT "produtores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propriedades_produtor" ADD CONSTRAINT "propriedades_produtor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propriedades_produtor" ADD CONSTRAINT "propriedades_produtor_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "produtores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talhoes_produtor" ADD CONSTRAINT "talhoes_produtor_propriedadeProdutorId_fkey" FOREIGN KEY ("propriedadeProdutorId") REFERENCES "propriedades_produtor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis_tecnicos" ADD CONSTRAINT "responsaveis_tecnicos_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis_tecnicos" ADD CONSTRAINT "responsaveis_tecnicos_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_propriedadeProdutorId_fkey" FOREIGN KEY ("propriedadeProdutorId") REFERENCES "propriedades_produtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_talhaoProdutorId_fkey" FOREIGN KEY ("talhaoProdutorId") REFERENCES "talhoes_produtor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cadeia_custodia_eventos" ADD CONSTRAINT "cadeia_custodia_eventos_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

