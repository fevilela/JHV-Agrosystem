import { notFound } from "next/navigation";
import { getEntityConfig } from "@/lib/entities";
import { EntityForm } from "@/components/crud/entity-form";
import { requireOrg } from "@/lib/tenant";
import { createEntityAction } from "../actions";

export default async function NewEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) notFound();

  await requireOrg();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        Novo {config.singular}
      </h1>
      <EntityForm
        config={config}
        action={createEntityAction.bind(null, entity)}
        backHref={`/cadastro/${entity}`}
      />
    </div>
  );
}
