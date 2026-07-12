import { prisma } from "@/lib/prisma";
import { AnimalForm } from "../animal-form";
import { createAnimalAction } from "../actions";

export default async function NewAnimalPage() {
  const [owners, animals] = await Promise.all([
    prisma.owner.findMany({ orderBy: { name: "asc" } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
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
