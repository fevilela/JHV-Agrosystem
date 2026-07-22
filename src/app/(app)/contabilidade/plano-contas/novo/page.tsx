import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getChartAccountFields } from "../fields";
import { createChartAccountAction } from "../actions";

export default async function NewChartAccountPage() {
  const accounts = await prisma.chartAccount.findMany({ orderBy: { code: "asc" } });
  const t = await getTranslations("contabilidade.planoContas");
  const tType = await getTranslations("labels.chartAccountType");
  const tNature = await getTranslations("labels.chartAccountNature");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getChartAccountFields(t, tType, tNature)}
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
