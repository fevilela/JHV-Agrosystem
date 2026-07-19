import { RecordForm } from "@/components/crud/record-form";
import { stallFields } from "../fields";
import { createStallAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewStallPage() {
  await requireModule("hipica");
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
