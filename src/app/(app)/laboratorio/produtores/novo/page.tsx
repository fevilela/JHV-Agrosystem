import { RecordForm } from "@/components/crud/record-form";
import { produtorFields } from "../fields";
import { createProdutorAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewProdutorPage() {
  await requireModule("laboratorio");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Produtor</h1>
      <RecordForm fields={produtorFields} action={createProdutorAction} backHref="/laboratorio/produtores" />
    </div>
  );
}
