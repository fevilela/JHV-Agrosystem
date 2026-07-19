import { prisma } from "@/lib/prisma";
import { EntityConfig, EntityField } from "@/lib/entities";

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

export async function createEntityRecord(
  config: EntityConfig,
  formData: FormData,
  organizationId: string
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  await delegate.create({ data: { ...data, organizationId } });
}

export async function updateEntityRecord(
  config: EntityConfig,
  id: string,
  formData: FormData,
  organizationId: string
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  await delegate.updateMany({ where: { id, organizationId }, data });
}

export async function deleteEntityRecord(
  config: EntityConfig,
  id: string,
  organizationId: string
) {
  const delegate = getDelegate(config.model);
  await delegate.deleteMany({ where: { id, organizationId } });
}
