import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMechanicFields } from "../fields";
import { updateMechanicAction } from "../actions";

export default async function EditMechanicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const mechanic = await prisma.mechanic.findFirst({ where: { id, organizationId } });
  if (!mechanic) notFound();

  const t = await getTranslations("oficina.pecas");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getMechanicFields(t)}
        action={updateMechanicAction.bind(null, id)}
        initialValues={mechanic}
        backHref="/oficina/pecas"
      />
    </div>
  );
}
