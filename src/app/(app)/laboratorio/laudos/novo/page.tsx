import { prisma } from "@/lib/prisma";
import { LaudoForm } from "../laudo-form";
import { createLaudoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewLaudoPage() {
  const { organizationId } = await requireModule("laboratorio");
  const [produtores, responsaveis, amostras] = await Promise.all([
    prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.responsavelTecnico.findMany({
      where: { organizationId, active: true },
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
    }),
    prisma.amostra.findMany({ where: { organizationId }, orderBy: { code: "asc" }, include: { propriedadeProdutor: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Laudo Técnico</h1>
      <LaudoForm
        action={createLaudoAction}
        produtores={produtores.map((p) => ({ id: p.id, label: p.name }))}
        responsaveis={responsaveis.map((r) => ({
          id: r.id,
          label: `${r.employee.name} (${r.tipoRegistro} ${r.registroProfissional})`,
        }))}
        amostras={amostras.map((a) => ({ id: a.id, label: `${a.code} — ${a.propriedadeProdutor.name}` }))}
        backHref="/laboratorio/laudos"
      />
    </div>
  );
}
