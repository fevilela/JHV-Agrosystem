-- CreateEnum
CREATE TYPE "StockCategory" AS ENUM ('MEDICAMENTO', 'INSUMO', 'RACAO', 'FERRAMENTA', 'PECA', 'COMBUSTIVEL', 'EPI', 'MATERIAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "StockBatchStatus" AS ENUM ('DISPONIVEL', 'CONSUMIDO');

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "StockCategory" NOT NULL DEFAULT 'OUTRO',
    "unit" TEXT,
    "minQuantity" DECIMAL(10,2),
    "currentQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_batches" (
    "id" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierName" TEXT,
    "status" "StockBatchStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_code_key" ON "stock_items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_barcode_key" ON "stock_items"("barcode");

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
