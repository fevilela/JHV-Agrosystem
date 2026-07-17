import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { chartAccountFields } from "../fields";
import { updateChartAccountAction } from "../actions";

export default async function EditChartAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [account, accounts] = await Promise.all([
    prisma.chartAccount.findUnique({ where: { id } }),
    prisma.chartAccount.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!account) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Conta</h1>
      <RecordForm
        fields={chartAccountFields}
        action={updateChartAccountAction.bind(null, id)}
        initialValues={account}
        relationOptions={{
          parentId: accounts
            .filter((a) => a.id !== id)
            .map((a) => ({ id: a.id, label: `${a.code} — ${a.name}` })),
        }}
        backHref="/contabilidade/plano-contas"
      />
    </div>
  );
}
