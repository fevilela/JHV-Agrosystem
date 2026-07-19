import { RecordForm } from "@/components/crud/record-form";
import { piqueteFields } from "../fields";
import { createPiqueteAction } from "../actions";

export default function NewPiquetePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Piquete</h1>
      <RecordForm
        fields={piqueteFields}
        action={createPiqueteAction}
        backHref="/hipica/piquetes"
      />
    </div>
  );
}
