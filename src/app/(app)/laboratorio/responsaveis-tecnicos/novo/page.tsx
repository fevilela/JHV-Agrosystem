import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { responsavelTecnicoCreateFields } from "../fields";
import { createResponsavelTecnicoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewResponsavelTecnicoPage() {
  const { organizationId } = await requireModule("laboratorio");
  const employees = await prisma.employee.findMany({
    where: { organizationId, responsavelTecnico: null },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Responsável Técnico</h1>
      {employees.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Todos os funcionários já estão cadastrados como responsáveis técnicos (ou não há funcionários
          cadastrados em Cadastro &gt; Funcionários).
        </p>
      ) : (
        <RecordForm
          fields={responsavelTecnicoCreateFields}
          action={createResponsavelTecnicoAction}
          relationOptions={{
            employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
          }}
          backHref="/laboratorio/responsaveis-tecnicos"
        />
      )}
    </div>
  );
}
