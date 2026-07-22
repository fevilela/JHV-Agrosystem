import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getChartAccountFields } from "../fields";
import { updateChartAccountAction } from "../actions";

export default async function EditChartAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [account, accounts] = await Promise.all([
    prisma.chartAccount.findFirst({ where: { id, organizationId } }),
    prisma.chartAccount.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  if (!account) notFound();

  const t = await getTranslations("contabilidade.planoContas");
  const tType = await getTranslations("labels.chartAccountType");
  const tNature = await getTranslations("labels.chartAccountNature");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getChartAccountFields(t, tType, tNature)}
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
