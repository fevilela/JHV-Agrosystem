import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getSafraFields } from "../fields";
import { createSafraAction } from "../actions";

export default async function NewSafraPage() {
  const { organizationId } = await requireOrg();
  const talhoes = await prisma.talhao.findMany({ where: { organizationId }, orderBy: { code: "asc" } });

  const t = await getTranslations("agricultura.safra");
  const tf = await getTranslations("agricultura.safra.fields");
  const tStatus = await getTranslations("labels.safraStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getSafraFields(tf, tStatus)}
        action={createSafraAction}
        initialValues={{ status: "PLANEJADA" }}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/safra"
      />
    </div>
  );
}
