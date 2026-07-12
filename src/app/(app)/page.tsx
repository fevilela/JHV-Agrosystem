import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Rabbit,
  Stethoscope,
  Building2,
  Truck,
  ShoppingBag,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [animais, proprietarios, clientes, fornecedores] = await Promise.all([
    prisma.animal.count(),
    prisma.owner.count(),
    prisma.client.count(),
    prisma.supplier.count(),
  ]);

  const cards = [
    {
      label: "Animais cadastrados",
      value: animais,
      href: "/cadastro/animais",
      icon: Rabbit,
    },
    {
      label: "Proprietários",
      value: proprietarios,
      href: "/cadastro/proprietarios",
      icon: Users,
    },
    {
      label: "Clientes",
      value: clientes,
      href: "/cadastro/clientes",
      icon: ShoppingBag,
    },
    {
      label: "Fornecedores",
      value: fornecedores,
      href: "/cadastro/fornecedores",
      icon: Truck,
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">
        Olá, {session?.user?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Visão geral do JHV Agrosystem
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">
                {card.label}
              </p>
              <card.icon size={18} className="text-brand-700" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 text-neutral-900">
          <Building2 size={18} className="text-brand-700" />
          <h2 className="text-sm font-semibold">Módulo em foco: Cadastro</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          O módulo de Cadastro está completo: proprietários, animais/cavalos,
          funcionários, veterinários, ferradores, instrutores, tratadores,
          clientes e fornecedores. Os demais módulos (Hípica, Pecuária,
          Agricultura, Máquinas, Estoque, Compras, Financeiro, RH e Oficina)
          já estão navegáveis no menu e serão implementados nas próximas
          etapas.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
          <Stethoscope size={14} />
          Próxima etapa sugerida: Módulo Hípica (controle diário, treinamento
          e nutrição)
        </div>
      </div>
    </div>
  );
}
