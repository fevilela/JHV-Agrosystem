/**
 * Backfills `organizationId` on models that just had the column added as
 * optional, before it's tightened to required in schema.prisma.
 *
 * Usage:
 *   npx tsx scripts/backfill-organization-scoping.ts --list-orgs
 *   npx tsx scripts/backfill-organization-scoping.ts --org <organizationId> --models stockItem,stockBatch
 *
 * Model names are the Prisma Client delegate names (camelCase), e.g. the
 * `Machine` model is `machine`, `UsageLog` is `usageLog`.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = value;
    }
  }
  return args;
}

async function listOrgs() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, createdAt: true, active: true },
  });
  console.table(orgs.map((o) => ({ id: o.id, name: o.name, active: o.active, createdAt: o.createdAt.toISOString() })));
}

async function backfill(orgId: string, modelNames: string[]) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    throw new Error(`Organização "${orgId}" não encontrada.`);
  }
  console.log(`Organização alvo: ${org.name} (${org.id})`);

  for (const modelName of modelNames) {
    const delegate = (prisma as unknown as Record<string, { updateMany: (args: unknown) => Promise<{ count: number }> }>)[
      modelName
    ];
    if (!delegate || typeof delegate.updateMany !== "function") {
      console.warn(`  [pulado] "${modelName}" não é um delegate válido do Prisma Client.`);
      continue;
    }
    const result = await delegate.updateMany({
      where: { organizationId: null },
      data: { organizationId: orgId },
    });
    console.log(`  ${modelName}: ${result.count} linha(s) atualizada(s).`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args["list-orgs"]) {
    await listOrgs();
    return;
  }

  const orgId = args.org;
  const models = args.models?.split(",").map((m) => m.trim()).filter(Boolean);

  if (!orgId || !models?.length) {
    console.error(
      "Uso:\n" +
        "  npx tsx scripts/backfill-organization-scoping.ts --list-orgs\n" +
        "  npx tsx scripts/backfill-organization-scoping.ts --org <organizationId> --models stockItem,stockBatch"
    );
    process.exitCode = 1;
    return;
  }

  await backfill(orgId, models);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
