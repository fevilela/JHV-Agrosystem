import { addMudaLoteMaoDeObraAction, deleteMudaLoteMaoDeObraAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/labels";

type Apontamento = {
  id: string;
  data: Date;
  atividade: string;
  horasTrabalhadas: unknown;
  custoHora: unknown;
  notes: string | null;
  employee: { name: string };
};

export function MaoDeObraSection({
  loteId,
  apontamentos,
  employees,
}: {
  loteId: string;
  apontamentos: Apontamento[];
  employees: { id: string; name: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form
        action={addMudaLoteMaoDeObraAction.bind(null, loteId)}
        className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Registrar Apontamento de Mão de Obra
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <select
            name="employeeId"
            required
            className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          >
            <option value="">Selecione o funcionário</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="data"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            name="atividade"
            placeholder="Atividade (ex.: repicagem, poda)"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            type="number"
            step="0.01"
            name="horasTrabalhadas"
            placeholder="Horas trabalhadas"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <input
            type="number"
            step="0.01"
            name="custoHora"
            placeholder="Custo/hora (opcional)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
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
          Mão de Obra Apontada
        </h3>
        {apontamentos.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum apontamento registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {apontamentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-800">{a.employee.name}</span>{" "}
                  <span className="text-neutral-600">
                    — {a.atividade} ({String(a.horasTrabalhadas)}h)
                  </span>
                  <span className="block text-xs text-neutral-400">
                    {formatDate(a.data)}
                    {a.custoHora != null ? ` — R$ ${String(a.custoHora)}/h` : ""}
                    {a.notes ? ` — ${a.notes}` : ""}
                  </span>
                </div>
                <DeleteButton onDelete={deleteMudaLoteMaoDeObraAction.bind(null, loteId, a.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
