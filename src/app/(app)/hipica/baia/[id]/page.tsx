import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { stallFields } from "../fields";
import { updateStallAction } from "../actions";
import { stallEventTypeLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";

export default async function StallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const stall = await prisma.stall.findFirst({
    where: { id, organizationId },
    include: {
      events: {
        orderBy: { date: "desc" },
        include: { animal: true },
        take: 30,
      },
    },
  });

  if (!stall) notFound();

  return (
    <div>
      <Link href="/hipica/baia" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Baia
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">
        Baia {stall.code}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={stallFields}
          action={updateStallAction.bind(null, id)}
          initialValues={stall}
          backHref="/hipica/baia"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Histórico
          </h2>
          {stall.events.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {stall.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between text-sm">
                  <div>
                    <p className="font-medium text-neutral-800">
                      {stallEventTypeLabels[event.type]}
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
    </div>
  );
}
