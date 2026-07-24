import { prisma } from "@/lib/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

type AuditChange = { field: string; before: unknown; after: unknown };

export function diffRecords(
  before?: Record<string, unknown> | null,
  after?: Record<string, unknown> | null
): AuditChange[] {
  const fields = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  const changes: AuditChange[] = [];
  const skipFields = new Set(["id", "organizationId", "updatedAt", "createdAt"]);
  for (const field of fields) {
    if (skipFields.has(field)) continue;
    const b = before?.[field] ?? null;
    const a = after?.[field] ?? null;
    const bStr = b instanceof Date ? b.toISOString() : JSON.stringify(b);
    const aStr = a instanceof Date ? a.toISOString() : JSON.stringify(a);
    if (bStr !== aStr) {
      changes.push({ field, before: b, after: a });
    }
  }
  return changes;
}

export async function logAudit({
  organizationId,
  userId,
  userName,
  action,
  entityType,
  entityId,
  before,
  after,
}: {
  organizationId: string;
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}) {
  const changes = before || after ? diffRecords(before, after) : undefined;
  if (action === "UPDATE" && changes && changes.length === 0) return;

  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: userId ?? null,
      userName: userName ?? null,
      action,
      entityType,
      entityId,
      changes: changes as unknown as Prisma.InputJsonValue,
    },
  });
}
