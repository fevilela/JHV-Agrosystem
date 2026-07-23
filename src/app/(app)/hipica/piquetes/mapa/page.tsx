import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/tenant";
import { PolygonMapViewLoader } from "@/components/map/polygon-map-view-loader";

export default async function PiquetesMapaPage() {
  const { organizationId } = await requireModule("hipica");
  const piquetes = await prisma.piquete.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
  });

  const comContorno = piquetes.filter((p) => p.boundary).length;

  return (
    <div>
      <Link href="/hipica/piquetes" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Piquetes
      </Link>
      <div className="mt-1 mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Mapa dos Piquetes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {comContorno} de {piquetes.length} piquete(s) com contorno desenhado.
        </p>
      </div>

      {comContorno === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum piquete tem contorno desenhado ainda. Abra um piquete e desenhe o contorno no mapa.
        </p>
      ) : (
        <PolygonMapViewLoader
          features={piquetes.map((p) => ({
            id: p.id,
            label: p.code,
            detail: p.location ?? undefined,
            boundary: p.boundary,
          }))}
        />
      )}
    </div>
  );
}
