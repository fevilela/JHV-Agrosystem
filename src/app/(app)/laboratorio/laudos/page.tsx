import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { laudoStatusLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";

const statusColor: Record<string, string> = {
  RASCUNHO: "bg-neutral-100 text-neutral-600",
  EMITIDO: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-700",
  REEMITIDO: "bg-blue-50 text-blue-700",
};

export default async function LaudosListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const laudos = await prisma.laudoTecnico.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { produtor: true, responsavelAssinante: { include: { employee: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Laudos Técnicos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {laudos.length} {laudos.length === 1 ? "laudo cadastrado" : "laudos cadastrados"}
          </p>
        </div>
        <Link
          href="/laboratorio/laudos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Laudo
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Produtor</th>
              <th className="px-4 py-3">Assinante</th>
              <th className="px-4 py-3">Emissão</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {laudos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum laudo cadastrado ainda.
                </td>
              </tr>
            )}
            {laudos.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/laboratorio/laudos/${l.id}`} className="font-medium text-brand-800 hover:underline">
                    {l.numero} {l.versao > 1 ? `(v${l.versao})` : ""}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{l.produtor.name}</td>
                <td className="px-4 py-3 text-neutral-700">{l.responsavelAssinante.employee.name}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(l.dataEmissao)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[l.status]}`}>
                    {laudoStatusLabels[l.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
