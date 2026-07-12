import { Construction } from "lucide-react";

export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Construction size={22} />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-neutral-500">
        {description ??
          "Este módulo ainda será implementado nas próximas etapas do sistema."}
      </p>
    </div>
  );
}
