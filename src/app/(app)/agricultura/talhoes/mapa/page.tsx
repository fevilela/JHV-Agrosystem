import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { PolygonMapViewLoader } from "@/components/map/polygon-map-view-loader";

export default async function TalhoesMapaPage() {
  const { organizationId } = await requireOrg();
  const talhoes = await prisma.talhao.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
  });

  const comContorno = talhoes.filter((t) => t.boundary).length;

  return (
    <div>
      <Link href="/agricultura/talhoes" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Talhões
      </Link>
      <div className="mt-1 mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Mapa dos Talhões</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {comContorno} de {talhoes.length} talhão(ões) com contorno desenhado.
        </p>
      </div>

      {comContorno === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum talhão tem contorno desenhado ainda. Abra um talhão e desenhe o contorno no mapa.
        </p>
      ) : (
        <PolygonMapViewLoader
          features={talhoes.map((t) => ({
            id: t.id,
            label: t.code,
            detail: t.name ?? undefined,
            boundary: t.boundary,
          }))}
        />
      )}
    </div>
  );
}
