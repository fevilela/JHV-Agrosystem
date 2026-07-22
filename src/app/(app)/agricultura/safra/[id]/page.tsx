import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getSafraFields } from "../fields";
import { updateSafraAction } from "../actions";

export default async function EditSafraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [safra, talhoes] = await Promise.all([
    prisma.safra.findFirst({ where: { id, talhao: { organizationId } } }),
    prisma.talhao.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  if (!safra) notFound();

  const t = await getTranslations("agricultura.safra");
  const tf = await getTranslations("agricultura.safra.fields");
  const tStatus = await getTranslations("labels.safraStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getSafraFields(tf, tStatus)}
        action={updateSafraAction.bind(null, id)}
        initialValues={safra}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/safra"
      />
    </div>
  );
}
