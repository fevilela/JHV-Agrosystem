import { RecordForm } from "@/components/crud/record-form";
import { storageFields } from "../fields";
import { createStorageAction } from "../actions";

export default function NewStoragePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Silo/Armazém</h1>
      <RecordForm
        fields={storageFields}
        action={createStorageAction}
        initialValues={{ type: "SILO" }}
        backHref="/agricultura/armazenagem"
      />
    </div>
  );
}
