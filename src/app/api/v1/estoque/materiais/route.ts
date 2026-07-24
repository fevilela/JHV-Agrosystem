import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, paginationParams } from "@/lib/api-auth";
import { paginatedJson } from "../../_lib/response";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const { skip, take, page, pageSize } = paginationParams(req);

  const where = { organizationId: auth.organizationId };
  const [rows, total] = await Promise.all([
    prisma.stockItem.findMany({ where, orderBy: { code: "asc" }, skip, take }),
    prisma.stockItem.count({ where }),
  ]);

  const data = rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    unit: r.unit,
    currentQuantity: Number(r.currentQuantity),
    minQuantity: r.minQuantity ? Number(r.minQuantity) : null,
  }));

  return paginatedJson(data, total, page, pageSize);
}
