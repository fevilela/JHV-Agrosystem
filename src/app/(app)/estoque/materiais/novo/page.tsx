import { RecordForm } from "@/components/crud/record-form";
import { stockItemFields } from "../fields";
import { createStockItemAction } from "../actions";

export default function NewStockItemPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Item</h1>
      <RecordForm
        fields={stockItemFields}
        action={createStockItemAction}
        backHref="/estoque/materiais"
      />
    </div>
  );
}
