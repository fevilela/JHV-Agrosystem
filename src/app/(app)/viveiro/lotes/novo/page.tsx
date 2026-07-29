import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaLoteCreateFields } from "../fields";
import { createMudaLoteAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewMudaLotePage() {
  const { organizationId } = await requireModule("viveiro");
  const [especies, viveiros, employees] = await Promise.all([
    prisma.mudaEspecie.findMany({ where: { organizationId }, orderBy: { nomePopular: "asc" } }),
    prisma.viveiro.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
    prisma.employee.findMany({ where: { organizationId, active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Lote de Produção</h1>
      <RecordForm
        fields={mudaLoteCreateFields}
        action={createMudaLoteAction}
        relationOptions={{
          especieId: especies.map((e) => ({ id: e.id, label: e.nomePopular })),
          viveiroId: viveiros.map((v) => ({ id: v.id, label: `${v.code} — ${v.name}` })),
          responsavelId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/viveiro/lotes"
      />
    </div>
  );
}
