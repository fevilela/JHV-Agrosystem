import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { PolygonMapViewLoader } from "@/components/map/polygon-map-view-loader";

export default async function PastagensMapaPage() {
  const { organizationId } = await requireOrg();
  const pastures = await prisma.pasture.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
  });

  const comContorno = pastures.filter((p) => p.boundary).length;

  return (
    <div>
      <Link href="/pecuaria/pastagens" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Pastagens
      </Link>
      <div className="mt-1 mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Mapa das Pastagens</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {comContorno} de {pastures.length} pasto(s) com contorno desenhado.
        </p>
      </div>

      {comContorno === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum pasto tem contorno desenhado ainda. Abra um pasto e desenhe o contorno no mapa.
        </p>
      ) : (
        <PolygonMapViewLoader
          features={pastures.map((p) => ({
            id: p.id,
            label: p.code,
            detail: p.name ?? undefined,
            boundary: p.boundary,
          }))}
        />
      )}
    </div>
  );
}
