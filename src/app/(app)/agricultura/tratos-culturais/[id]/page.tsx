import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getTratoFields } from "../fields";
import { updateTratoAction } from "../actions";

export default async function EditTratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trato, safras] = await Promise.all([
    prisma.tratoCultural.findUnique({ where: { id } }),
    prisma.safra.findMany({ orderBy: { name: "asc" }, include: { talhao: true } }),
  ]);

  if (!trato) notFound();

  const t = await getTranslations("agricultura.tratosCulturais");
  const tf = await getTranslations("agricultura.tratosCulturais.fields");
  const tType = await getTranslations("labels.tratoCulturalType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getTratoFields(tf, tType)}
        action={updateTratoAction.bind(null, id)}
        initialValues={trato}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/tratos-culturais"
      />
    </div>
  );
}
