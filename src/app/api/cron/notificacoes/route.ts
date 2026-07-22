import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPendencias } from "@/lib/pendencias";

async function gerarNotificacoesParaOrganizacao(organizationId: string) {
  const pendencias = await getPendencias(organizationId);

  const existentes = await prisma.notification.findMany({
    where: { organizationId },
    select: { sourceKey: true },
  });
  const existentesSet = new Set(existentes.map((n) => n.sourceKey));

  let criadas = 0;
  for (const p of pendencias) {
    const severity = p.severity === "vencido" ? "VENCIDO" : "VENCENDO";
    if (!existentesSet.has(p.id)) criadas++;

    await prisma.notification.upsert({
      where: { organizationId_sourceKey: { organizationId, sourceKey: p.id } },
      update: {
        category: p.category,
        title: p.title,
        detail: p.detail,
        href: p.href,
        severity,
      },
      create: {
        organizationId,
        sourceKey: p.id,
        category: p.category,
        title: p.title,
        detail: p.detail,
        href: p.href,
        severity,
      },
    });
  }

  // Remove notificações não lidas cuja pendência não existe mais (ex: conta paga, item reabastecido)
  const currentKeys = pendencias.map((p) => p.id);
  await prisma.notification.deleteMany({
    where: {
      organizationId,
      read: false,
      sourceKey: currentKeys.length > 0 ? { notIn: currentKeys } : undefined,
    },
  });

  return criadas;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const organizacoes = await prisma.organization.findMany({ where: { active: true } });
  const resultado: Record<string, number> = {};

  for (const org of organizacoes) {
    resultado[org.id] = await gerarNotificacoesParaOrganizacao(org.id);
  }

  return NextResponse.json({ processadas: resultado });
}
