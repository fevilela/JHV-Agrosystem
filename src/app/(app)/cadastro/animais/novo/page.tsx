import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnimalForm } from "../animal-form";
import { createAnimalAction } from "../actions";
import { requireOrg } from "@/lib/tenant";

export default async function NewAnimalPage() {
  const { organizationId } = await requireOrg();
  const [owners, animals] = await Promise.all([
    prisma.owner.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);
  const t = await getTranslations("cadastro.animais");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        {t("new")}
      </h1>
      <AnimalForm
        action={createAnimalAction}
        owners={owners}
        animalsForGenealogy={animals}
        backHref="/cadastro/animais"
      />
    </div>
  );
}
