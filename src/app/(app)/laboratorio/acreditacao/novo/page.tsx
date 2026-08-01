import { RecordForm } from "@/components/crud/record-form";
import { acreditacaoFields } from "../fields";
import { createAcreditacaoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewAcreditacaoPage() {
  await requireModule("laboratorio");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Acreditação</h1>
      <RecordForm fields={acreditacaoFields} action={createAcreditacaoAction} backHref="/laboratorio/acreditacao" />
    </div>
  );
}
