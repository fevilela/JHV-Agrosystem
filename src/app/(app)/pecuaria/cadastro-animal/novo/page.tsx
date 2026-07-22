import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getLivestockAnimalFields } from "../fields";
import { createLivestockAnimalAction } from "../actions";

export default async function NewLivestockAnimalPage() {
  const { organizationId } = await requireOrg();
  const [lotes, pastures] = await Promise.all([
    prisma.lote.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
    prisma.pasture.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  const t = await getTranslations("pecuaria.cadastroAnimal");
  const tf = await getTranslations("pecuaria.cadastroAnimal.fields");
  const tSexo = await getTranslations("labels.animalSexo");
  const tCategory = await getTranslations("labels.livestockCategory");
  const tStatus = await getTranslations("labels.livestockStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getLivestockAnimalFields(tf, tSexo, tCategory, tStatus)}
        action={createLivestockAnimalAction}
        initialValues={{ status: "ATIVO" }}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
          pastureId: pastures.map((p) => ({ id: p.id, label: p.code })),
        }}
        backHref="/pecuaria/cadastro-animal"
      />
    </div>
  );
}
