import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMovementFields } from "../fields";
import { createMovementAction } from "../actions";

export default async function NewMovementPage() {
  const { organizationId } = await requireOrg();
  const [animals, lotes] = await Promise.all([
    prisma.livestockAnimal.findMany({ where: { organizationId }, orderBy: { brinco: "asc" } }),
    prisma.lote.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  const t = await getTranslations("pecuaria.manejo");
  const tf = await getTranslations("pecuaria.manejo.fields");
  const tType = await getTranslations("labels.managementMovementType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getMovementFields(tf, tType)}
        action={createMovementAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/manejo"
      />
    </div>
  );
}
