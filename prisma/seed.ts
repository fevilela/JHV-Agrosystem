import { PrismaClient, ChartAccountType, ChartAccountNature } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type ChartAccountSeed = {
  code: string;
  name: string;
  type: ChartAccountType;
  nature: ChartAccountNature;
  analytic: boolean;
  parentCode?: string;
};

const chartOfAccounts: ChartAccountSeed[] = [
  { code: "1", name: "ATIVO", type: "ATIVO", nature: "DEVEDORA", analytic: false },
  { code: "1.1", name: "Ativo Circulante", type: "ATIVO", nature: "DEVEDORA", analytic: false, parentCode: "1" },
  { code: "1.1.1", name: "Caixa e Bancos", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.1" },
  { code: "1.1.2", name: "Clientes a Receber", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.1" },
  { code: "1.1.3", name: "Estoque de Insumos", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.1" },
  { code: "1.1.4", name: "Estoque de Produtos Agrícolas", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.1" },
  { code: "1.1.5", name: "Rebanho - Pecuária", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.1" },
  { code: "1.2", name: "Ativo Não Circulante", type: "ATIVO", nature: "DEVEDORA", analytic: false, parentCode: "1" },
  { code: "1.2.1", name: "Máquinas e Equipamentos", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.2" },
  { code: "1.2.2", name: "Animais - Hípica", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.2" },
  { code: "1.2.3", name: "Benfeitorias e Instalações", type: "ATIVO", nature: "DEVEDORA", analytic: true, parentCode: "1.2" },
  { code: "1.2.4", name: "Depreciação Acumulada", type: "ATIVO", nature: "CREDORA", analytic: true, parentCode: "1.2" },

  { code: "2", name: "PASSIVO", type: "PASSIVO", nature: "CREDORA", analytic: false },
  { code: "2.1", name: "Passivo Circulante", type: "PASSIVO", nature: "CREDORA", analytic: false, parentCode: "2" },
  { code: "2.1.1", name: "Fornecedores a Pagar", type: "PASSIVO", nature: "CREDORA", analytic: true, parentCode: "2.1" },
  { code: "2.1.2", name: "Salários a Pagar", type: "PASSIVO", nature: "CREDORA", analytic: true, parentCode: "2.1" },
  { code: "2.1.3", name: "Impostos a Recolher", type: "PASSIVO", nature: "CREDORA", analytic: true, parentCode: "2.1" },
  { code: "2.2", name: "Passivo Não Circulante", type: "PASSIVO", nature: "CREDORA", analytic: false, parentCode: "2" },
  { code: "2.2.1", name: "Empréstimos e Financiamentos", type: "PASSIVO", nature: "CREDORA", analytic: true, parentCode: "2.2" },

  { code: "3", name: "PATRIMÔNIO LÍQUIDO", type: "PATRIMONIO_LIQUIDO", nature: "CREDORA", analytic: false },
  { code: "3.1", name: "Capital Social", type: "PATRIMONIO_LIQUIDO", nature: "CREDORA", analytic: true, parentCode: "3" },
  { code: "3.2", name: "Lucros/Prejuízos Acumulados", type: "PATRIMONIO_LIQUIDO", nature: "CREDORA", analytic: true, parentCode: "3" },

  { code: "4", name: "RECEITAS", type: "RECEITA", nature: "CREDORA", analytic: false },
  { code: "4.1", name: "Venda de Animais", type: "RECEITA", nature: "CREDORA", analytic: true, parentCode: "4" },
  { code: "4.2", name: "Venda de Produção Agrícola", type: "RECEITA", nature: "CREDORA", analytic: true, parentCode: "4" },
  { code: "4.3", name: "Serviços Hípica", type: "RECEITA", nature: "CREDORA", analytic: true, parentCode: "4" },
  { code: "4.4", name: "Produção de Leite", type: "RECEITA", nature: "CREDORA", analytic: true, parentCode: "4" },
  { code: "4.5", name: "Outras Receitas", type: "RECEITA", nature: "CREDORA", analytic: true, parentCode: "4" },

  { code: "5", name: "CUSTOS", type: "CUSTO", nature: "DEVEDORA", analytic: false },
  { code: "5.1", name: "Insumos Agrícolas", type: "CUSTO", nature: "DEVEDORA", analytic: true, parentCode: "5" },
  { code: "5.2", name: "Nutrição Animal", type: "CUSTO", nature: "DEVEDORA", analytic: true, parentCode: "5" },
  { code: "5.3", name: "Sanidade Animal", type: "CUSTO", nature: "DEVEDORA", analytic: true, parentCode: "5" },
  { code: "5.4", name: "Manutenção de Máquinas", type: "CUSTO", nature: "DEVEDORA", analytic: true, parentCode: "5" },
  { code: "5.5", name: "Mão de Obra Direta", type: "CUSTO", nature: "DEVEDORA", analytic: true, parentCode: "5" },

  { code: "6", name: "DESPESAS", type: "DESPESA", nature: "DEVEDORA", analytic: false },
  { code: "6.1", name: "Despesas Administrativas", type: "DESPESA", nature: "DEVEDORA", analytic: true, parentCode: "6" },
  { code: "6.2", name: "Despesas com Pessoal", type: "DESPESA", nature: "DEVEDORA", analytic: true, parentCode: "6" },
  { code: "6.3", name: "Despesas Financeiras", type: "DESPESA", nature: "DEVEDORA", analytic: true, parentCode: "6" },
  { code: "6.4", name: "Depreciação", type: "DESPESA", nature: "DEVEDORA", analytic: true, parentCode: "6" },
];

async function seedChartOfAccounts() {
  const idByCode = new Map<string, string>();

  for (const acc of chartOfAccounts) {
    const parentId = acc.parentCode ? idByCode.get(acc.parentCode) : undefined;
    const record = await prisma.chartAccount.upsert({
      where: { code: acc.code },
      update: {
        name: acc.name,
        type: acc.type,
        nature: acc.nature,
        analytic: acc.analytic,
        parentId,
      },
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        nature: acc.nature,
        analytic: acc.analytic,
        parentId,
      },
    });
    idByCode.set(acc.code, record.id);
  }

  console.log(`Plano de contas pronto: ${chartOfAccounts.length} contas.`);
}

async function main() {
  const email = "admin@jhvagrosystem.com";
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Usuário admin pronto:", user.email);

  await seedChartOfAccounts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
