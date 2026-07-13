import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { equineHealthRecordTypeLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteEquineHealthRecordAction } from "@/app/(app)/hipica/sanidade/actions";

type HealthRecord = {
  id: string;
  type: string;
  date: Date;
  product: string | null;
  nextDoseDate: Date | null;
  notes: string | null;
};

export function SaudeSection({ records }: { records: HealthRecord[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/hipica/sanidade/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Registro
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          Nenhum registro de sanidade ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Próxima Dose</th>
                <th className="px-4 py-3">Observações</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-neutral-700">{equineHealthRecordTypeLabels[r.type]}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.product || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(r.nextDoseDate)}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/hipica/sanidade/${r.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteEquineHealthRecordAction.bind(null, r.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
