import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaPedidoVendaFields } from "../fields";
import { createMudaPedidoVendaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewMudaPedidoVendaPage() {
  const { organizationId } = await requireModule("viveiro");
  const clientes = await prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Pedido de Venda</h1>
      <RecordForm
        fields={mudaPedidoVendaFields}
        action={createMudaPedidoVendaAction}
        relationOptions={{
          clienteId: clientes.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/viveiro/pedidos"
      />
    </div>
  );
}
