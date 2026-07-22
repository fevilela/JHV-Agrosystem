import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMilkFields } from "../fields";
import { createMilkAction } from "../actions";

export default async function NewMilkPage() {
  const { organizationId } = await requireOrg();
  const animals = await prisma.livestockAnimal.findMany({ where: { organizationId }, orderBy: { brinco: "asc" } });

  const t = await getTranslations("pecuaria.producaoLeite");
  const tf = await getTranslations("pecuaria.producaoLeite.fields");
  const tShift = await getTranslations("labels.milkShift");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getMilkFields(tf, tShift)}
        action={createMilkAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/producao-leite"
      />
    </div>
  );
}
