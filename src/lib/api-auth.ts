import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-keys";

export async function authenticateApiKey(
  req: NextRequest
): Promise<{ organizationId: string } | NextResponse> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  if (!token) {
    return NextResponse.json(
      { error: "Autenticação necessária: header 'Authorization: Bearer <chave>'." },
      { status: 401 }
    );
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(token) } });
  if (!apiKey || apiKey.revoked) {
    return NextResponse.json({ error: "Chave de API inválida ou revogada." }, { status: 401 });
  }

  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { organizationId: apiKey.organizationId };
}

export function paginationParams(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("pageSize")) || 25));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
