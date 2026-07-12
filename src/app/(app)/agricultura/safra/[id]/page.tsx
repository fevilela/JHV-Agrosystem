import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { safraFields } from "../fields";
import { updateSafraAction } from "../actions";

export default async function EditSafraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [safra, talhoes] = await Promise.all([
    prisma.safra.findUnique({ where: { id } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!safra) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Safra</h1>
      <RecordForm
        fields={safraFields}
        action={updateSafraAction.bind(null, id)}
        initialValues={safra}
        relationOptions={{
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/agricultura/safra"
      />
    </div>
  );
}
