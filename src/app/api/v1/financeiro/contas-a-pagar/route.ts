import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, paginationParams } from "@/lib/api-auth";
import { paginatedJson } from "../../_lib/response";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const { skip, take, page, pageSize } = paginationParams(req);

  const where = { organizationId: auth.organizationId, type: "PAGAR" as const };
  const [rows, total] = await Promise.all([
    prisma.financeEntry.findMany({
      where,
      orderBy: { dueDate: "asc" },
      skip,
      take,
      include: { supplier: true, costCenter: true },
    }),
    prisma.financeEntry.count({ where }),
  ]);

  const data = rows.map((r) => ({
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    dueDate: r.dueDate,
    paymentDate: r.paymentDate,
    status: r.status,
    supplier: r.supplier?.name ?? null,
    costCenter: r.costCenter?.name ?? null,
  }));

  return paginatedJson(data, total, page, pageSize);
}
