import { RecordForm } from "@/components/crud/record-form";
import { pastureFields } from "../fields";
import { createPastureAction } from "../actions";

export default function NewPasturePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Pastagem</h1>
      <RecordForm
        fields={pastureFields}
        action={createPastureAction}
        initialValues={{ rotationStatus: "EM_USO" }}
        backHref="/pecuaria/pastagens"
      />
    </div>
  );
}
