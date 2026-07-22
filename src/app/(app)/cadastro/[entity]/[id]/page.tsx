import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEntityConfig } from "@/lib/entities";
import { getEntity } from "@/lib/crud";
import { EntityForm } from "@/components/crud/entity-form";
import { requireOrg } from "@/lib/tenant";
import { updateEntityAction } from "../actions";

export default async function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const { entity, id } = await params;
  const t = await getTranslations("cadastro");
  const tList = await getTranslations("cadastro.list");
  const config = getEntityConfig(entity, t);
  if (!config) notFound();

  const { organizationId } = await requireOrg();
  const record = await getEntity(config, id, organizationId);
  if (!record) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        {tList("edit", { singular: config.singular })}
      </h1>
      <EntityForm
        config={config}
        action={updateEntityAction.bind(null, entity, id)}
        initialValues={record}
        backHref={`/cadastro/${entity}`}
      />
    </div>
  );
}
