import { getTranslations, getLocale } from "next-intl/server";
import { formatDate } from "@/lib/labels";

export type TimelineCategory =
  | "saude"
  | "treino"
  | "dieta"
  | "baia"
  | "agenda"
  | "competicao"
  | "transacao";

export type TimelineEntry = {
  date: Date;
  category: TimelineCategory;
  title: string;
  detail?: string | null;
};

const categoryColor: Record<TimelineCategory, string> = {
  saude: "bg-red-50 text-red-700",
  treino: "bg-blue-50 text-blue-700",
  dieta: "bg-amber-50 text-amber-700",
  baia: "bg-purple-50 text-purple-700",
  agenda: "bg-teal-50 text-teal-700",
  competicao: "bg-green-50 text-green-700",
  transacao: "bg-neutral-100 text-neutral-600",
};

export async function HistoricoSection({ entries }: { entries: TimelineEntry[] }) {
  const t = await getTranslations("cadastro.animais.history");
  const locale = await getLocale();

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div className="w-24 flex-shrink-0 pt-0.5 text-xs text-neutral-500">
            {formatDate(e.date, locale)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  categoryColor[e.category] || "bg-neutral-100 text-neutral-600"
                }`}
              >
                {t(`categories.${e.category}`)}
              </span>
              <span className="text-sm font-medium text-neutral-800">{e.title}</span>
            </div>
            {e.detail && <p className="mt-1 text-sm text-neutral-500">{e.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
