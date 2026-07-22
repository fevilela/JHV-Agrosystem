import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getPastureFields } from "../fields";
import { updatePastureAction } from "../actions";

export default async function EditPasturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pasture = await prisma.pasture.findUnique({ where: { id } });
  if (!pasture) notFound();

  const t = await getTranslations("pecuaria.pastagens");
  const tf = await getTranslations("pecuaria.pastagens.fields");
  const tStatus = await getTranslations("labels.pastureRotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getPastureFields(tf, tStatus)}
        action={updatePastureAction.bind(null, id)}
        initialValues={pasture}
        backHref="/pecuaria/pastagens"
      />
    </div>
  );
}
