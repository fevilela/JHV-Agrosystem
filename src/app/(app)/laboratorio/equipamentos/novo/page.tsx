import { RecordForm } from "@/components/crud/record-form";
import { equipamentoFields } from "../fields";
import { createEquipamentoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewEquipamentoPage() {
  await requireModule("laboratorio");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Equipamento</h1>
      <RecordForm fields={equipamentoFields} action={createEquipamentoAction} backHref="/laboratorio/equipamentos" />
    </div>
  );
}
