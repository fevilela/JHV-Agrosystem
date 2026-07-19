import { prisma } from "@/lib/prisma";
import { ContractForm } from "../contract-form";
import { createContractAction } from "../actions";

export default async function NewContractPage() {
  const [clients, animals, stalls, piquetes] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
    prisma.stall.findMany({ orderBy: { code: "asc" } }),
    prisma.piquete.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Contrato</h1>
      <div className="max-w-3xl">
        <ContractForm
          action={createContractAction}
          clients={clients}
          animals={animals}
          stalls={stalls}
          piquetes={piquetes}
        />
      </div>
    </div>
  );
}
