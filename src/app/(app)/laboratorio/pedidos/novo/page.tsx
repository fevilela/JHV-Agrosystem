import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { pedidoAnaliseFields } from "../fields";
import { createPedidoAnaliseAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewPedidoAnalisePage() {
  const { organizationId } = await requireModule("laboratorio");
  const produtores = await prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Pedido de Análise</h1>
      <RecordForm
        fields={pedidoAnaliseFields}
        action={createPedidoAnaliseAction}
        relationOptions={{
          produtorId: produtores.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/laboratorio/pedidos"
      />
    </div>
  );
}
