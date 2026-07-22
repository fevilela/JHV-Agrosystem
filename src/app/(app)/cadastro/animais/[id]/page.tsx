import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnimalForm } from "../animal-form";
import { updateAnimalAction, deleteAnimalAction } from "../actions";
import { PhotosSection } from "./photos-section";
import { DocumentsSection } from "./documents-section";
import { SaudeSection } from "./saude-section";
import { HistoricoSection, type TimelineEntry } from "./historico-section";
import { Tabs } from "@/components/tabs";
import { DeleteButton } from "@/components/crud/delete-button";
import { ModulePlaceholder } from "@/components/placeholder";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency } from "@/lib/labels";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();
  const t = await getTranslations("cadastro.animais");
  const tl = await getTranslations("labels");
  const locale = await getLocale();

  const [
    animal,
    owners,
    animals,
    healthRecords,
    trainingSessions,
    diets,
    stallEvents,
    agendaEvents,
    competitions,
    transactions,
  ] = await Promise.all([
    prisma.animal.findFirst({
      where: { id, organizationId },
      include: {
        owner: true,
        pai: true,
        mae: true,
        photos: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        filhosComoPai: true,
        filhosComoMae: true,
      },
    }),
    prisma.owner.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.equineHealthRecord.findMany({ where: { animalId: id }, orderBy: { date: "desc" } }),
    prisma.trainingSession.findMany({ where: { animalId: id } }),
    prisma.animalDiet.findMany({ where: { animalId: id } }),
    prisma.stallEvent.findMany({ where: { animalId: id }, include: { stall: true } }),
    prisma.agendaEvent.findMany({ where: { animalId: id } }),
    prisma.competition.findMany({ where: { animalId: id } }),
    prisma.animalTransaction.findMany({ where: { animalId: id } }),
  ]);

  if (!animal) notFound();

  const filhos = [...animal.filhosComoPai, ...animal.filhosComoMae];
  const genealogyOptions = animals.filter((a) => a.id !== id);

  const timeline: TimelineEntry[] = [
    ...healthRecords.map((r) => ({
      date: r.date,
      category: "saude" as const,
      title: tl(`equineHealthRecordType.${r.type}`),
      detail: [r.product, r.notes].filter(Boolean).join(" — ") || null,
    })),
    ...trainingSessions.map((ts) => ({
      date: ts.date,
      category: "treino" as const,
      title: tl(`exerciseType.${ts.exerciseType}`),
      detail: [ts.evolution, ts.notes].filter(Boolean).join(" — ") || null,
    })),
    ...diets.map((d) => ({
      date: d.startDate,
      category: "dieta" as const,
      title: t("history.newDiet"),
      detail: [d.suplementos, d.notes].filter(Boolean).join(" — ") || null,
    })),
    ...stallEvents.map((s) => ({
      date: s.date,
      category: "baia" as const,
      title: `${tl(`stallEventType.${s.type}`)} — Baia ${s.stall.code}`,
      detail: s.notes,
    })),
    ...agendaEvents.map((a) => ({
      date: a.date,
      category: "agenda" as const,
      title: `${a.title} (${tl(`agendaEventType.${a.type}`)})`,
      detail: a.notes,
    })),
    ...competitions.map((c) => ({
      date: c.date,
      category: "competicao" as const,
      title: c.name,
      detail: [c.result, c.location].filter(Boolean).join(" — ") || null,
    })),
    ...transactions.map((tr) => ({
      date: tr.date,
      category: "transacao" as const,
      title: `${tl(`animalTransactionType.${tr.type}`)} — ${formatCurrency(tr.value, locale)}`,
      detail: tr.counterpartyName,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/cadastro/animais"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← {t("detail.backLink")}
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">
            {animal.name}
          </h1>
        </div>
        <DeleteButton
          onDelete={deleteAnimalAction.bind(null, id)}
        />
      </div>

      <Tabs
        tabs={[
          {
            id: "dados",
            label: t("detail.tabs.general"),
            content: (
              <AnimalForm
                action={updateAnimalAction.bind(null, id)}
                animal={animal}
                owners={owners}
                animalsForGenealogy={genealogyOptions}
                backHref="/cadastro/animais"
              />
            ),
          },
          {
            id: "genealogia",
            label: t("detail.tabs.genealogy"),
            content: (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    {t("detail.father")}
                  </h3>
                  {animal.pai ? (
                    <Link
                      href={`/cadastro/animais/${animal.pai.id}`}
                      className="text-brand-800 hover:underline"
                    >
                      {animal.pai.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-400">{t("detail.notInformed")}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    {t("detail.mother")}
                  </h3>
                  {animal.mae ? (
                    <Link
                      href={`/cadastro/animais/${animal.mae.id}`}
                      className="text-brand-800 hover:underline"
                    >
                      {animal.mae.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-400">{t("detail.notInformed")}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:col-span-2">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    {t("detail.children", { count: filhos.length })}
                  </h3>
                  {filhos.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                      {t("detail.noChildren")}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filhos.map((f) => (
                        <li key={f.id}>
                          <Link
                            href={`/cadastro/animais/${f.id}`}
                            className="text-sm text-brand-800 hover:underline"
                          >
                            {f.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ),
          },
          {
            id: "fotos",
            label: t("detail.tabs.photos"),
            content: <PhotosSection animalId={id} photos={animal.photos} />,
          },
          {
            id: "documentos",
            label: t("detail.tabs.documents"),
            content: (
              <DocumentsSection animalId={id} documents={animal.documents} />
            ),
          },
          {
            id: "saude",
            label: t("detail.tabs.health"),
            content: <SaudeSection records={healthRecords} />,
          },
          {
            id: "historico",
            label: t("detail.tabs.history"),
            content: <HistoricoSection entries={timeline} />,
          },
          {
            id: "treinamento",
            label: t("detail.tabs.training"),
            content: (
              <ModulePlaceholder
                title={t("detail.trainingPlaceholderTitle")}
                description={t("detail.trainingPlaceholderDescription")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
