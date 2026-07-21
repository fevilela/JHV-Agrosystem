import { notFound } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { contractTypeLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteContractAction } from "../actions";
import { SendContractEmailButton } from "./send-contract-email-button";
import { SendContractWhatsappButton } from "./send-contract-whatsapp-button";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId },
    include: { client: true, animal: true, stall: true, piquete: true },
  });

  if (!contract) notFound();

  const rows: { label: string; value: string }[] = [
    { label: "Tipo", value: contractTypeLabels[contract.type] },
    { label: "Cliente", value: contract.client.name },
    { label: "Animal", value: contract.animal?.name || "—" },
  ];

  if (contract.type === "BAIA" && contract.stall) {
    rows.push({ label: "Baia", value: contract.stall.code });
  }
  if (contract.type === "PIQUETE" && contract.piquete) {
    rows.push({ label: "Piquete", value: contract.piquete.code });
  }

  rows.push(
    { label: "Valor Mensal", value: formatCurrency(contract.monthlyValue) },
    { label: "Dia de Vencimento", value: String(contract.dueDay) },
    { label: "Data de Início", value: formatDate(contract.startDate) },
    { label: "Gerado em", value: formatDate(contract.createdAt) }
  );

  return (
    <div>
      <Link href="/hipica/contratos" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Contratos
      </Link>
      <div className="mt-1 mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">
          Contrato — {contract.client.name}
        </h1>
        <div className="flex items-center gap-2">
          <a
            href={`/hipica/contratos/${contract.id}/pdf`}
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <FileDown size={16} />
            Baixar PDF
          </a>
          <SendContractEmailButton contractId={contract.id} />
          <SendContractWhatsappButton contractId={contract.id} />
          <DeleteButton onDelete={deleteContractAction.bind(null, contract.id)} />
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-7">
        <dl className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-sm text-neutral-800">{row.value}</dd>
            </div>
          ))}
        </dl>
        {contract.notes && (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Observações
            </dt>
            <dd className="mt-0.5 text-sm text-neutral-800">{contract.notes}</dd>
          </div>
        )}
      </div>
    </div>
  );
}
