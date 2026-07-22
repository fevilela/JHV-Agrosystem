import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getIrrigationFields } from "../fields";
import { updateIrrigationAction } from "../actions";

export default async function EditIrrigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, talhoes] = await Promise.all([
    prisma.irrigation.findUnique({ where: { id } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("agricultura.irrigacao");
  const tf = await getTranslations("agricultura.irrigacao.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getIrrigationFields(tf)}
        action={updateIrrigationAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/irrigacao"
      />
    </div>
  );
}
