import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getIrrigationFields } from "../fields";
import { createIrrigationAction } from "../actions";

export default async function NewIrrigationPage() {
  const talhoes = await prisma.talhao.findMany({ orderBy: { code: "asc" } });

  const t = await getTranslations("agricultura.irrigacao");
  const tf = await getTranslations("agricultura.irrigacao.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getIrrigationFields(tf)}
        action={createIrrigationAction}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/irrigacao"
      />
    </div>
  );
}
