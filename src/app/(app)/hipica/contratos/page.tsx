import Link from "next/link";
import { Plus, FileDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { contractTypeLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteContractAction } from "./actions";

export default async function ContratosListPage() {
  const { organizationId } = await requireModule("hipica");
  const contracts = await prisma.contract.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { client: true, animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Contratos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {contracts.length} {contracts.length === 1 ? "contrato gerado" : "contratos gerados"}
          </p>
        </div>
        <Link
          href="/hipica/contratos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Contrato
        </Link>
      </div>

      {contracts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum contrato gerado ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Animal</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Gerado em</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/hipica/contratos/${contract.id}`}
                      className="font-medium text-brand-800 hover:underline"
                    >
                      {contract.client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {contractTypeLabels[contract.type]}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {contract.animal?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {formatCurrency(contract.monthlyValue)}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {formatDate(contract.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/hipica/contratos/${contract.id}/pdf`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Baixar PDF"
                      >
                        <FileDown size={16} />
                      </a>
                      <DeleteButton onDelete={deleteContractAction.bind(null, contract.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
