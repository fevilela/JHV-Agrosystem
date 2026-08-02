import { FileText } from "lucide-react";
import { addMudaLoteCertificadoAction, deleteMudaLoteCertificadoAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/labels";

type Certificado = {
  id: string;
  url: string;
  nome: string;
  emitidoEm: Date | null;
  notes: string | null;
};

export function CertificadosSection({
  loteId,
  certificados,
}: {
  loteId: string;
  certificados: Certificado[];
}) {
  return (
    <div className="space-y-4">
      <form
        action={addMudaLoteCertificadoAction.bind(null, loteId)}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Documento de certificação
          </label>
          <input type="file" name="file" required className="w-full text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Emitido em (opcional)
          </label>
          <input
            type="date"
            name="emitidoEm"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Observações (opcional)
          </label>
          <input
            name="notes"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Enviar
        </button>
      </form>

      {certificados.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          Nenhum certificado anexado ainda.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {certificados.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between px-4 py-3">
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-neutral-700 hover:text-brand-800"
              >
                <FileText size={18} className="text-neutral-400" />
                <span>
                  {cert.nome}
                  {cert.emitidoEm && (
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      emitido em {formatDate(cert.emitidoEm)}
                    </span>
                  )}
                  {cert.notes && <span className="block text-xs text-neutral-400">{cert.notes}</span>}
                </span>
              </a>
              <DeleteButton onDelete={deleteMudaLoteCertificadoAction.bind(null, loteId, cert.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
