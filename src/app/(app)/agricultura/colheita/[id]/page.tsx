import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getHarvestFields } from "../fields";
import { updateHarvestAction } from "../actions";

export default async function EditHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [harvest, safras] = await Promise.all([
    prisma.harvest.findUnique({ where: { id } }),
    prisma.safra.findMany({ orderBy: { name: "asc" }, include: { talhao: true } }),
  ]);

  if (!harvest) notFound();

  const t = await getTranslations("agricultura.colheita");
  const tf = await getTranslations("agricultura.colheita.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getHarvestFields(tf)}
        action={updateHarvestAction.bind(null, id)}
        initialValues={harvest}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/colheita"
      />
    </div>
  );
}
