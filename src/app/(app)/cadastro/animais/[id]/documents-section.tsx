import { FileText } from "lucide-react";
import {
  uploadAnimalDocumentAction,
  deleteAnimalDocumentAction,
} from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";

type Doc = { id: string; url: string; name: string; type: string | null };

export function DocumentsSection({
  animalId,
  documents,
}: {
  animalId: string;
  documents: Doc[];
}) {
  return (
    <div className="space-y-6">
      <form
        action={uploadAnimalDocumentAction.bind(null, animalId)}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Arquivo
          </label>
          <input type="file" name="file" required className="w-full text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tipo (ex: Registro, Exame, Nota Fiscal)
          </label>
          <input
            name="type"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Enviar Documento
        </button>
      </form>

      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          Nenhum documento cadastrado ainda.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-neutral-700 hover:text-brand-800"
              >
                <FileText size={18} className="text-neutral-400" />
                <span>
                  {doc.name}
                  {doc.type && (
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      {doc.type}
                    </span>
                  )}
                </span>
              </a>
              <DeleteButton
                onDelete={deleteAnimalDocumentAction.bind(
                  null,
                  animalId,
                  doc.id
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
