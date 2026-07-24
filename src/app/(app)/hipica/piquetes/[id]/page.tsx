import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { piqueteFields } from "../fields";
import { updatePiqueteAction } from "../actions";
import { piqueteEventTypeLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import { PiqueteBoundarySection } from "./piquete-boundary-section";

export default async function PiqueteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const piquete = await prisma.piquete.findFirst({
    where: { id, organizationId },
    include: {
      events: {
        orderBy: { date: "desc" },
        include: { animal: true },
        take: 30,
      },
    },
  });

  if (!piquete) notFound();

  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/hipica/piquetes" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Piquetes
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">
        Piquete {piquete.code}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={piqueteFields}
          action={updatePiqueteAction.bind(null, id)}
          initialValues={piquete}
          relationOptions={{
            propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
          }}
          backHref="/hipica/piquetes"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Histórico
          </h2>
          {piquete.events.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {piquete.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between text-sm">
                  <div>
                    <p className="font-medium text-neutral-800">
                      {piqueteEventTypeLabels[event.type]}
                    </p>
                    {event.animal && (
                      <p className="text-xs text-neutral-500">{event.animal.name}</p>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400">{formatDate(event.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PiqueteBoundarySection piqueteId={id} boundary={piquete.boundary} />
      </div>
    </div>
  );
}
