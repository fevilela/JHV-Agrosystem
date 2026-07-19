import { prisma } from "@/lib/prisma";
import { ContractForm } from "../contract-form";
import { createContractAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewContractPage() {
  const { organizationId } = await requireModule("hipica");
  const [clients, animals, stalls, piquetes] = await Promise.all([
    prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.stall.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
    prisma.piquete.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
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
