import { RecordForm } from "@/components/crud/record-form";
import { mechanicFields } from "../fields";
import { createMechanicAction } from "../actions";

export default function NewMechanicPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Mecânico</h1>
      <RecordForm
        fields={mechanicFields}
        action={createMechanicAction}
        initialValues={{ active: true }}
        backHref="/oficina/pecas"
      />
    </div>
  );
}
