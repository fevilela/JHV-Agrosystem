import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, paginationParams } from "@/lib/api-auth";
import { paginatedJson } from "../_lib/response";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const { skip, take, page, pageSize } = paginationParams(req);

  const where = { organizationId: auth.organizationId };
  const [rows, total] = await Promise.all([
    prisma.livestockAnimal.findMany({
      where,
      orderBy: { brinco: "asc" },
      skip,
      take,
    }),
    prisma.livestockAnimal.count({ where }),
  ]);

  const data = rows.map((r) => ({
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
  }));

  return paginatedJson(data, total, page, pageSize);
}
