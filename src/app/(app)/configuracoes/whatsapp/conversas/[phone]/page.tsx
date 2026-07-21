import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { ReplyForm } from "./reply-form";

const statusLabels: Record<string, string> = {
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  LIDO: "Lido",
  FALHOU: "Falhou",
};

export default async function WhatsappConversaPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  const { organizationId } = await requireOrg();

  const mensagens = await prisma.whatsappMessage.findMany({
    where: { organizationId, phone },
    orderBy: { createdAt: "asc" },
    include: { client: { select: { name: true } } },
  });

  if (mensagens.length === 0) notFound();

  const nomeCliente = mensagens.find((m) => m.client)?.client?.name;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <Link
          href="/configuracoes/whatsapp/conversas"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← Conversas
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">{nomeCliente ?? phone}</h1>
        {nomeCliente && <p className="text-xs text-neutral-400">{phone}</p>}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.direction === "SAIDA" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.direction === "SAIDA"
                    ? "bg-brand-700 text-white"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`mt-1 text-right text-[10px] ${
                    m.direction === "SAIDA" ? "text-brand-100" : "text-neutral-400"
                  }`}
                >
                  {m.createdAt.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.direction === "SAIDA" && ` · ${statusLabels[m.status] ?? m.status}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <ReplyForm phone={phone} />
      </div>
    </div>
  );
}
