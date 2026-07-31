import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { produtorFields } from "../fields";
import { updateProdutorAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditProdutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const produtor = await prisma.produtor.findFirst({
    where: { id, organizationId },
    include: { propriedades: { orderBy: { name: "asc" } } },
  });
  if (!produtor) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Produtor</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={produtorFields}
          action={updateProdutorAction.bind(null, id)}
          initialValues={produtor}
          backHref="/laboratorio/produtores"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Propriedades
          </h2>
          {produtor.propriedades.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhuma propriedade cadastrada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {produtor.propriedades.map((prop) => (
                <li key={prop.id}>
                  <Link
                    href={`/laboratorio/propriedades/${prop.id}`}
                    className="text-sm text-brand-800 hover:underline"
                  >
                    {prop.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/laboratorio/propriedades/novo?produtorId=${id}`}
            className="mt-4 inline-block text-xs text-neutral-500 hover:text-neutral-800"
          >
            + Nova propriedade pra este produtor
          </Link>
        </div>
      </div>
    </div>
  );
}
