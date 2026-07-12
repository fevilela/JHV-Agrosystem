-- CreateEnum
CREATE TYPE "LivestockCategory" AS ENUM ('CORTE', 'LEITE', 'CONFINAMENTO', 'CRIA', 'RECRIA', 'ENGORDA', 'REPRODUTOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "LivestockStatus" AS ENUM ('ATIVO', 'VENDIDO', 'ABATIDO', 'OBITO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PastureRotationStatus" AS ENUM ('EM_USO', 'DESCANSO');

-- CreateEnum
CREATE TYPE "ReproductionMethod" AS ENUM ('IA', 'MONTA_NATURAL');

-- CreateEnum
CREATE TYPE "DiagnosisResult" AS ENUM ('PRENHE', 'VAZIA', 'INDEFINIDO');

-- CreateEnum
CREATE TYPE "HealthRecordType" AS ENUM ('VACINA_BRUCELOSE', 'VACINA_AFTOSA', 'CARRAPATICIDA', 'VERMIFUGO', 'TRATAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "MilkShift" AS ENUM ('MANHA', 'TARDE');

-- CreateEnum
CREATE TYPE "FeedingType" AS ENUM ('PASTO', 'CONFINAMENTO', 'SEMI_CONFINAMENTO');

-- CreateEnum
CREATE TYPE "ManagementMovementType" AS ENUM ('MOVIMENTACAO', 'EMBARQUE', 'COMPRA', 'VENDA');

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "category" "LivestockCategory",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pastures" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "areaHectares" DECIMAL(10,2),
    "capacityHead" INTEGER,
    "rotationStatus" "PastureRotationStatus" NOT NULL DEFAULT 'EM_USO',
    "grassHeightCm" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pastures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_animals" (
    "id" TEXT NOT NULL,
    "brinco" TEXT NOT NULL,
    "rfid" TEXT,
    "name" TEXT,
    "sexo" "AnimalSexo",
    "raca" TEXT,
    "category" "LivestockCategory" NOT NULL DEFAULT 'OUTRO',
    "dataNascimento" TIMESTAMP(3),
    "pesoAtual" DECIMAL(8,2),
    "status" "LivestockStatus" NOT NULL DEFAULT 'ATIVO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "loteId" TEXT,
    "pastureId" TEXT,

    CONSTRAINT "livestock_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reproductions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "method" "ReproductionMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "diagnosisDate" TIMESTAMP(3),
    "diagnosisResult" "DiagnosisResult",
    "expectedBirthDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "weaningDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reproductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "type" "HealthRecordType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "product" TEXT,
    "nextDoseDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weightKg" DECIMAL(8,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_productions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" "MilkShift",
    "liters" DECIMAL(6,2) NOT NULL,
    "ccs" DECIMAL(10,2),
    "cbt" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milk_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_feedings" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "FeedingType" NOT NULL DEFAULT 'PASTO',
    "silagemKg" DECIMAL(8,2),
    "suplementacaoKg" DECIMAL(8,2),
    "consumoKg" DECIMAL(8,2),
    "custoDiario" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livestock_feedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_movements" (
    "id" TEXT NOT NULL,
    "animalId" TEXT,
    "loteId" TEXT,
    "type" "ManagementMovementType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "value" DECIMAL(12,2),
    "counterpartyName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lotes_code_key" ON "lotes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pastures_code_key" ON "pastures"("code");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_animals_brinco_key" ON "livestock_animals"("brinco");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_animals_rfid_key" ON "livestock_animals"("rfid");

-- AddForeignKey
ALTER TABLE "livestock_animals" ADD CONSTRAINT "livestock_animals_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_animals" ADD CONSTRAINT "livestock_animals_pastureId_fkey" FOREIGN KEY ("pastureId") REFERENCES "pastures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductions" ADD CONSTRAINT "reproductions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "livestock_animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "livestock_animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "livestock_animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_productions" ADD CONSTRAINT "milk_productions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "livestock_animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_feedings" ADD CONSTRAINT "livestock_feedings_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_movements" ADD CONSTRAINT "management_movements_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "livestock_animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_movements" ADD CONSTRAINT "management_movements_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
