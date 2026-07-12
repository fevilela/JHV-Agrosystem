import { RecordForm } from "@/components/crud/record-form";
import { talhaoFields } from "../fields";
import { createTalhaoAction } from "../actions";

export default function NewTalhaoPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Talhão</h1>
      <RecordForm
        fields={talhaoFields}
        action={createTalhaoAction}
        backHref="/agricultura/talhoes"
      />
    </div>
  );
}
