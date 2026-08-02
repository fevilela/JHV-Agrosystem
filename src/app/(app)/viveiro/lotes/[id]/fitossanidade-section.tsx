import {
  addMudaLoteFitossanidadeAction,
  deleteMudaLoteFitossanidadeAction,
} from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate, mudaFitossanidadeTipoLabels, toOptions } from "@/lib/labels";

type Fitossanidade = {
  id: string;
  data: Date;
  tipo: string;
  produtoAplicado: string | null;
  dosagem: string | null;
  notes: string | null;
  responsavel: { name: string } | null;
};

export function FitossanidadeSection({
  loteId,
  eventos,
  employees,
}: {
  loteId: string;
  eventos: Fitossanidade[];
  employees: { id: string; name: string }[];
}) {
  const tipoOptions = toOptions(mudaFitossanidadeTipoLabels);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form
        action={addMudaLoteFitossanidadeAction.bind(null, loteId)}
        className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Registrar Evento Fitossanitário
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            name="data"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <select
            name="tipo"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          >
            <option value="">Tipo</option>
            {tipoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            name="produtoAplicado"
            placeholder="Produto aplicado (opcional)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            name="dosagem"
            placeholder="Dosagem (opcional)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <select
            name="responsavelId"
            className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
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
          Histórico Fitossanitário
        </h3>
        {eventos.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum evento registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {eventos.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-800">{formatDate(ev.data)}</span>{" "}
                  <span className="text-neutral-600">
                    — {mudaFitossanidadeTipoLabels[ev.tipo] ?? ev.tipo}
                  </span>
                  {ev.produtoAplicado && (
                    <span className="text-neutral-600"> ({ev.produtoAplicado}{ev.dosagem ? `, ${ev.dosagem}` : ""})</span>
                  )}
                  <span className="block text-xs text-neutral-400">
                    {ev.responsavel?.name}
                    {ev.notes ? ` — ${ev.notes}` : ""}
                  </span>
                </div>
                <DeleteButton
                  onDelete={deleteMudaLoteFitossanidadeAction.bind(null, loteId, ev.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
