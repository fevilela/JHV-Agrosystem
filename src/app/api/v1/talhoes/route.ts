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
    prisma.talhao.findMany({ where, orderBy: { code: "asc" }, skip, take }),
    prisma.talhao.count({ where }),
  ]);

  const data = rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    areaHectares: r.areaHectares ? Number(r.areaHectares) : null,
    soilType: r.soilType,
    boundary: r.boundary,
  }));

  return paginatedJson(data, total, page, pageSize);
}
