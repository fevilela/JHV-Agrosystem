import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { chartAccountFields } from "../fields";
import { createChartAccountAction } from "../actions";

export default async function NewChartAccountPage() {
  const accounts = await prisma.chartAccount.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Conta</h1>
      <RecordForm
        fields={chartAccountFields}
        action={createChartAccountAction}
        initialValues={{ active: true, analytic: true }}
        relationOptions={{
          parentId: accounts.map((a) => ({ id: a.id, label: `${a.code} — ${a.name}` })),
        }}
        backHref="/contabilidade/plano-contas"
      />
    </div>
  );
}
