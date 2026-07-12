-- CreateEnum
CREATE TYPE "SafraStatus" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'COLHIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TratoCulturalType" AS ENUM ('ADUBACAO', 'PULVERIZACAO', 'HERBICIDA', 'INSETICIDA', 'FUNGICIDA', 'OUTRO');

-- CreateEnum
CREATE TYPE "FertilityType" AS ENUM ('ANALISE_SOLO', 'CALAGEM', 'GESSAGEM', 'CORRECAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('SILO', 'ARMAZEM');

-- CreateEnum
CREATE TYPE "StorageMovementType" AS ENUM ('ENTRADA', 'SAIDA', 'QUEBRA');

-- CreateTable
CREATE TABLE "talhoes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "areaHectares" DECIMAL(10,2),
    "soilType" TEXT,
    "coordinates" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talhoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safras" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cultura" TEXT NOT NULL,
    "variedade" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFimPrevista" TIMESTAMP(3),
    "custoPrevisto" DECIMAL(12,2),
    "status" "SafraStatus" NOT NULL DEFAULT 'PLANEJADA',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantios" (
    "id" TEXT NOT NULL,
    "safraId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sementes" TEXT,
    "populacaoPlantasHa" DECIMAL(10,2),
    "maquina" TEXT,
    "operador" TEXT,
    "tempoHoras" DECIMAL(6,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tratos_culturais" (
    "id" TEXT NOT NULL,
    "safraId" TEXT NOT NULL,
    "type" "TratoCulturalType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "product" TEXT,
    "dose" TEXT,
    "operador" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tratos_culturais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fertilities" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "type" "FertilityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ph" DECIMAL(4,2),
    "results" TEXT,
    "recommendation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fertilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigations" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "consumoM3" DECIMAL(10,2),
    "horasBomba" DECIMAL(6,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "irrigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvests" (
    "id" TEXT NOT NULL,
    "safraId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "producaoKg" DECIMAL(12,2),
    "umidade" DECIMAL(5,2),
    "qualidade" TEXT,
    "maquina" TEXT,
    "operador" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harvests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "type" "StorageType" NOT NULL DEFAULT 'SILO',
    "capacityTon" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_movements" (
    "id" TEXT NOT NULL,
    "storageId" TEXT NOT NULL,
    "safraId" TEXT,
    "type" "StorageMovementType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityTon" DECIMAL(10,2) NOT NULL,
    "umidade" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "talhoes_code_key" ON "talhoes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "storages_code_key" ON "storages"("code");

-- AddForeignKey
ALTER TABLE "safras" ADD CONSTRAINT "safras_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "talhoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantios" ADD CONSTRAINT "plantios_safraId_fkey" FOREIGN KEY ("safraId") REFERENCES "safras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratos_culturais" ADD CONSTRAINT "tratos_culturais_safraId_fkey" FOREIGN KEY ("safraId") REFERENCES "safras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilities" ADD CONSTRAINT "fertilities_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "talhoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigations" ADD CONSTRAINT "irrigations_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "talhoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_safraId_fkey" FOREIGN KEY ("safraId") REFERENCES "safras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_movements" ADD CONSTRAINT "storage_movements_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "storages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_movements" ADD CONSTRAINT "storage_movements_safraId_fkey" FOREIGN KEY ("safraId") REFERENCES "safras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
