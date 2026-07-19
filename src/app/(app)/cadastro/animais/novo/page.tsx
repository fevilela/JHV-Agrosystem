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

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        Novo Animal
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
