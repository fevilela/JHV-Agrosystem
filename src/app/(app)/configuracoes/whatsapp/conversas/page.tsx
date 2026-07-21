import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";

export default async function WhatsappConversasPage() {
  const { organizationId } = await requireOrg();

  const mensagens = await prisma.whatsappMessage.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { client: { select: { name: true } } },
  });

  const conversas = new Map<
    string,
    { phone: string; nomeCliente: string | null; ultimaMensagem: string; data: Date; naoLida: boolean }
  >();

  for (const m of mensagens) {
    if (conversas.has(m.phone)) continue;
    conversas.set(m.phone, {
      phone: m.phone,
      nomeCliente: m.client?.name ?? null,
      ultimaMensagem: m.content,
      data: m.createdAt,
      naoLida: m.direction === "ENTRADA",
    });
  }

  const lista = Array.from(conversas.values());

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Conversas do WhatsApp</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Mensagens recebidas e enviadas pelo número conectado dessa organização.
      </p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {lista.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-400">
            Nenhuma conversa ainda. As mensagens aparecem aqui assim que forem enviadas ou
            recebidas pelo número conectado.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {lista.map((c) => (
              <li key={c.phone}>
                <Link
                  href={`/configuracoes/whatsapp/conversas/${c.phone}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-50"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <MessageCircle size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {c.nomeCliente ?? c.phone}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{c.ultimaMensagem}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-neutral-400">
                    {c.data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
