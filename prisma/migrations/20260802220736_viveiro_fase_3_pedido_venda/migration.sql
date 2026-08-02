-- CreateEnum
CREATE TYPE "MudaPedidoVendaStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'ENTREGUE', 'CANCELADO');

-- CreateTable
CREATE TABLE "muda_pedidos_venda" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MudaPedidoVendaStatus" NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" DECIMAL(12,2),
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "muda_pedidos_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muda_pedido_venda_itens" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "muda_pedido_venda_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muda_lote_certificados" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emitidoEm" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muda_lote_certificados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "muda_pedidos_venda_organizationId_numero_key" ON "muda_pedidos_venda"("organizationId", "numero");

-- AddForeignKey
ALTER TABLE "muda_pedidos_venda" ADD CONSTRAINT "muda_pedidos_venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_pedidos_venda" ADD CONSTRAINT "muda_pedidos_venda_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_pedido_venda_itens" ADD CONSTRAINT "muda_pedido_venda_itens_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "muda_pedidos_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_pedido_venda_itens" ADD CONSTRAINT "muda_pedido_venda_itens_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muda_lote_certificados" ADD CONSTRAINT "muda_lote_certificados_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "muda_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
