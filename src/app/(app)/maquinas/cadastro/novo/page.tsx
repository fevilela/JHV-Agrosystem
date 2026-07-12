import { RecordForm } from "@/components/crud/record-form";
import { machineFields } from "../fields";
import { createMachineAction } from "../actions";

export default function NewMachinePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Máquina</h1>
      <RecordForm
        fields={machineFields}
        action={createMachineAction}
        initialValues={{ status: "ATIVO" }}
        backHref="/maquinas/cadastro"
      />
    </div>
  );
}
