import { RecordForm } from "@/components/crud/record-form";
import { metodoAnaliticoFields } from "../fields";
import { createMetodoAnaliticoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewMetodoAnaliticoPage() {
  await requireModule("laboratorio");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Método Analítico</h1>
      <RecordForm
        fields={metodoAnaliticoFields}
        action={createMetodoAnaliticoAction}
        backHref="/laboratorio/metodos"
      />
    </div>
  );
}
