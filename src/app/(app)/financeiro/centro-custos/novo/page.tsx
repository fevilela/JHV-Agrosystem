import { RecordForm } from "@/components/crud/record-form";
import { costCenterFields } from "../fields";
import { createCostCenterAction } from "../actions";

export default function NewCostCenterPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Centro de Custo</h1>
      <RecordForm
        fields={costCenterFields}
        action={createCostCenterAction}
        backHref="/financeiro/centro-custos"
      />
    </div>
  );
}
