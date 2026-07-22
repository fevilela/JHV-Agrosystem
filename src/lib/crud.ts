import { prisma } from "@/lib/prisma";
import { EntityConfig, EntityField } from "@/lib/entities";
import { logAudit } from "@/lib/audit";

// The entity models covered here (Owner, Client, Supplier, Employee,
// Veterinarian, Farrier, Instructor, Handler) share a simple id/CRUD shape,
// so we access the Prisma delegate dynamically by model name instead of
// repeating near-identical CRUD code once per model.
type Delegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  updateMany: (args: unknown) => Promise<{ count: number }>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

function getDelegate(model: EntityConfig["model"]): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[model];
}

export async function listEntities(config: EntityConfig, organizationId: string) {
  const delegate = getDelegate(config.model);
  return delegate.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
}

export async function getEntity(config: EntityConfig, id: string, organizationId: string) {
  const delegate = getDelegate(config.model);
  return delegate.findFirst({ where: { id, organizationId } });
}

function parseFieldValue(field: EntityField, raw: FormDataEntryValue | null) {
  if (field.type === "checkbox") {
    return raw === "on" || raw === "true";
  }
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value === "") return null;
  if (field.type === "number") return Number(value);
  if (field.type === "date") return new Date(value);
  return value;
}

export function buildData(config: EntityConfig, formData: FormData) {
  const data: Record<string, unknown> = {};
  for (const field of config.fields) {
    data[field.name] = parseFieldValue(field, formData.get(field.name));
  }
  return data;
}

type Actor = { userId?: string | null; userName?: string | null };

export async function createEntityRecord(
  config: EntityConfig,
  formData: FormData,
  organizationId: string,
  actor?: Actor
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  const record = await delegate.create({ data: { ...data, organizationId } });
  await logAudit({
    organizationId,
    userId: actor?.userId,
    userName: actor?.userName,
    action: "CREATE",
    entityType: config.model,
    entityId: record.id as string,
    after: record,
  });
}

export async function updateEntityRecord(
  config: EntityConfig,
  id: string,
  formData: FormData,
  organizationId: string,
  actor?: Actor
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  const before = await delegate.findFirst({ where: { id, organizationId } });
  await delegate.updateMany({ where: { id, organizationId }, data });
  if (before) {
    await logAudit({
      organizationId,
      userId: actor?.userId,
      userName: actor?.userName,
      action: "UPDATE",
      entityType: config.model,
      entityId: id,
      before,
      after: { ...before, ...data },
    });
  }
}

export async function deleteEntityRecord(
  config: EntityConfig,
  id: string,
  organizationId: string,
  actor?: Actor
) {
  const delegate = getDelegate(config.model);
  const before = await delegate.findFirst({ where: { id, organizationId } });
  await delegate.deleteMany({ where: { id, organizationId } });
  if (before) {
    await logAudit({
      organizationId,
      userId: actor?.userId,
      userName: actor?.userName,
      action: "DELETE",
      entityType: config.model,
      entityId: id,
      before,
    });
  }
}
