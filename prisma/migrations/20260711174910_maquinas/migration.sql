-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('TRATOR', 'COLHEITADEIRA', 'PULVERIZADOR', 'CAMINHAO', 'IMPLEMENTO', 'CARRETA', 'OUTRO');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('ATIVO', 'MANUTENCAO', 'INATIVO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVA', 'CORRETIVA', 'TROCA_OLEO', 'TROCA_PNEU', 'LUBRIFICACAO', 'OUTRO');

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "type" "MachineType" NOT NULL DEFAULT 'OUTRO',
    "brand" TEXT,
    "model" TEXT,
    "plateOrSerial" TEXT,
    "year" INTEGER,
    "acquisitionDate" TIMESTAMP(3),
    "status" "MachineStatus" NOT NULL DEFAULT 'ATIVO',
    "horimetroAtual" DECIMAL(10,1),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "horimetro" DECIMAL(10,1) NOT NULL,
    "combustivelLitros" DECIMAL(8,2),
    "operador" TEXT,
    "talhaoId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(12,2),
    "horimetro" DECIMAL(10,1),
    "nextDueDate" TIMESTAMP(3),
    "nextDueHorimetro" DECIMAL(10,1),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machines_plateOrSerial_key" ON "machines"("plateOrSerial");

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "talhoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
