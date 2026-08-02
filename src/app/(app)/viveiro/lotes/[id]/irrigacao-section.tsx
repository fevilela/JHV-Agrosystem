import { addMudaLoteIrrigacaoAction, deleteMudaLoteIrrigacaoAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/labels";

type Irrigacao = {
  id: string;
  data: Date;
  metodo: string | null;
  duracaoMinutos: number | null;
  notes: string | null;
  responsavel: { name: string } | null;
};

export function IrrigacaoSection({
  loteId,
  irrigacoes,
  employees,
}: {
  loteId: string;
  irrigacoes: Irrigacao[];
  employees: { id: string; name: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form
        action={addMudaLoteIrrigacaoAction.bind(null, loteId)}
        className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Registrar Irrigação
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            name="data"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            name="metodo"
            placeholder="Método (ex.: gotejo, aspersão)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            type="number"
            name="duracaoMinutos"
            placeholder="Duração (min)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <select
            name="responsavelId"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          >
            <option value="">Responsável (opcional)</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            name="notes"
            placeholder="Observações (opcional)"
            className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Registrar
        </button>
      </form>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Histórico de Irrigação
        </h3>
        {irrigacoes.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum evento registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {irrigacoes.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-800">{formatDate(ev.data)}</span>{" "}
                  {ev.metodo && <span className="text-neutral-600">— {ev.metodo}</span>}
                  {ev.duracaoMinutos != null && (
                    <span className="text-neutral-600"> ({ev.duracaoMinutos} min)</span>
                  )}
                  <span className="block text-xs text-neutral-400">
                    {ev.responsavel?.name}
                    {ev.notes ? ` — ${ev.notes}` : ""}
                  </span>
                </div>
                <DeleteButton onDelete={deleteMudaLoteIrrigacaoAction.bind(null, loteId, ev.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
