import { RecordForm } from "@/components/crud/record-form";
import { loteFields } from "../../lote-fields";
import { createLoteAction } from "../../lote-actions";

export default function NewLotePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Lote</h1>
      <RecordForm
        fields={loteFields}
        action={createLoteAction}
        backHref="/pecuaria/manejo/lotes"
      />
    </div>
  );
}
