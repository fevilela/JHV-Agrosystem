import { prisma } from "@/lib/prisma";
import { EntityConfig, EntityField } from "@/lib/entities";

// The entity models covered here (Owner, Client, Supplier, Employee,
// Veterinarian, Farrier, Instructor, Handler) share a simple id/CRUD shape,
// so we access the Prisma delegate dynamically by model name instead of
// repeating near-identical CRUD code once per model.
type Delegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
  delete: (args: unknown) => Promise<Record<string, unknown>>;
};

function getDelegate(model: EntityConfig["model"]): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[model];
}

export async function listEntities(config: EntityConfig) {
  const delegate = getDelegate(config.model);
  return delegate.findMany({ orderBy: { name: "asc" } });
}

export async function getEntity(config: EntityConfig, id: string) {
  const delegate = getDelegate(config.model);
  return delegate.findUnique({ where: { id } });
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
  formData: FormData
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  await delegate.create({ data });
}

export async function updateEntityRecord(
  config: EntityConfig,
  id: string,
  formData: FormData
) {
  const delegate = getDelegate(config.model);
  const data = buildData(config, formData);
  await delegate.update({ where: { id }, data });
}

export async function deleteEntityRecord(config: EntityConfig, id: string) {
  const delegate = getDelegate(config.model);
  await delegate.delete({ where: { id } });
}
