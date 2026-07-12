import { RecordForm } from "@/components/crud/record-form";
import { stallFields } from "../fields";
import { createStallAction } from "../actions";

export default function NewStallPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Baia</h1>
      <RecordForm
        fields={stallFields}
        action={createStallAction}
        backHref="/hipica/baia"
      />
    </div>
  );
}
