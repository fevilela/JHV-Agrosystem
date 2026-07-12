-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('EXERCICIO_GERAL', 'SALTO', 'TAMBOR', 'MARCHA', 'CORRIDA', 'ADESTRAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Intensity" AS ENUM ('LEVE', 'MODERADA', 'INTENSA');

-- CreateEnum
CREATE TYPE "StallStatus" AS ENUM ('LIVRE', 'OCUPADA', 'LIMPEZA', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StallEventType" AS ENUM ('OCUPACAO', 'DESOCUPACAO', 'LIMPEZA', 'MANUTENCAO', 'TROCA');

-- CreateEnum
CREATE TYPE "AgendaEventType" AS ENUM ('FERRADOR', 'VETERINARIO', 'VACINA', 'COMPETICAO', 'TRANSPORTE', 'OUTRO');

-- CreateEnum
CREATE TYPE "AgendaEventStatus" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('MENSALIDADE', 'HOSPEDAGEM', 'TREINAMENTO', 'VETERINARIO', 'MEDICAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "FinancialEntryStatus" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AnimalTransactionType" AS ENUM ('COMPRA', 'VENDA', 'LEILAO');

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "instructorId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "exerciseType" "ExerciseType" NOT NULL DEFAULT 'EXERCICIO_GERAL',
    "durationMin" INTEGER,
    "intensity" "Intensity",
    "evolution" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_diets" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concentradoKg" DECIMAL(6,2),
    "fenoKg" DECIMAL(6,2),
    "silagemKg" DECIMAL(6,2),
    "suplementos" TEXT,
    "quantidadeDiariaKg" DECIMAL(6,2),
    "custoDiario" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_diets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stalls" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "status" "StallStatus" NOT NULL DEFAULT 'LIVRE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentAnimalId" TEXT,

    CONSTRAINT "stalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stall_events" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "type" "StallEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animalId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stall_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AgendaEventType" NOT NULL DEFAULT 'OUTRO',
    "date" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT,
    "status" "AgendaEventStatus" NOT NULL DEFAULT 'AGENDADO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "category" TEXT,
    "result" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transports" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "driver" TEXT,
    "vehicle" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_animals" (
    "id" TEXT NOT NULL,
    "transportId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,

    CONSTRAINT "transport_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" TEXT NOT NULL,
    "type" "FinancialEntryType" NOT NULL DEFAULT 'OUTRO',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "status" "FinancialEntryStatus" NOT NULL DEFAULT 'PENDENTE',
    "animalId" TEXT,
    "clientId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_transactions" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "type" "AnimalTransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "commission" DECIMAL(12,2),
    "counterpartyName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stalls_code_key" ON "stalls"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stalls_currentAnimalId_key" ON "stalls"("currentAnimalId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_animals_transportId_animalId_key" ON "transport_animals"("transportId", "animalId");

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_diets" ADD CONSTRAINT "animal_diets_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_currentAnimalId_fkey" FOREIGN KEY ("currentAnimalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stall_events" ADD CONSTRAINT "stall_events_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stall_events" ADD CONSTRAINT "stall_events_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_animals" ADD CONSTRAINT "transport_animals_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "transports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_animals" ADD CONSTRAINT "transport_animals_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_transactions" ADD CONSTRAINT "animal_transactions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
