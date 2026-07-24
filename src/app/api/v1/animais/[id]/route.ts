import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const r = await prisma.livestockAnimal.findFirst({
    where: { id, organizationId: auth.organizationId },
    include: {
      weighings: { orderBy: { date: "desc" }, take: 20 },
      healthRecords: { orderBy: { date: "desc" }, take: 20 },
    },
  });
  if (!r) return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });

  return NextResponse.json({
    id: r.id,
    brinco: r.brinco,
    rfid: r.rfid,
    name: r.name,
    sexo: r.sexo,
    raca: r.raca,
    category: r.category,
    dataNascimento: r.dataNascimento,
    pesoAtual: r.pesoAtual ? Number(r.pesoAtual) : null,
    status: r.status,
    notes: r.notes,
    weighings: r.weighings.map((w) => ({ id: w.id, date: w.date, weightKg: Number(w.weightKg) })),
    healthRecords: r.healthRecords.map((h) => ({
      id: h.id,
      date: h.date,
      type: h.type,
      product: h.product,
      nextDoseDate: h.nextDoseDate,
    })),
  });
}
