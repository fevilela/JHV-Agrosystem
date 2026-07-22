import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getTratoFields } from "../fields";
import { createTratoAction } from "../actions";

export default async function NewTratoPage() {
  const { organizationId } = await requireOrg();
  const safras = await prisma.safra.findMany({
    where: { talhao: { organizationId } },
    orderBy: { name: "asc" },
    include: { talhao: true },
  });

  const t = await getTranslations("agricultura.tratosCulturais");
  const tf = await getTranslations("agricultura.tratosCulturais.fields");
  const tType = await getTranslations("labels.tratoCulturalType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getTratoFields(tf, tType)}
        action={createTratoAction}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/tratos-culturais"
        offline={{ moduleLabel: t("title"), syncEndpoint: "/api/sync/tratos-culturais" }}
      />
    </div>
  );
}
