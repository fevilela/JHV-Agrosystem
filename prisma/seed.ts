import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedChartOfAccounts } from "../src/lib/chart-of-accounts";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@jhvagrosystem.com";
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { isSuperAdmin: true },
    create: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
      isSuperAdmin: true,
    },
  });

  console.log("Usuário admin pronto:", user.email);

  const organization = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (organization) {
    const count = await seedChartOfAccounts(prisma, organization.id);
    console.log(`Plano de contas pronto para ${organization.name}: ${count} contas.`);
  } else {
    console.log("Nenhuma organização encontrada — plano de contas não semeado.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
