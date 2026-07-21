import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { ConnectWhatsappButton } from "./connect-button";
import { desconectarWhatsappAction } from "./actions";

export default async function WhatsappSettingsPage() {
  const { organizationId } = await requireOrg();
  const connection = await prisma.whatsappConnection.findUnique({
    where: { organizationId },
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Conectar WhatsApp</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Conecte um número de WhatsApp Business dedicado a este sistema — a Meta cria o número
        pra você durante a conexão. O sistema passa a enviar automaticamente o link do boleto
        pro cliente (sempre que um boleto for gerado ou reemitido) e também mostra as conversas
        recebidas, com opção de responder por aqui.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-neutral-800">
                WhatsApp conectado{connection.businessName ? ` — ${connection.businessName}` : ""}
              </p>
            </div>
            <p className="text-xs text-neutral-500">
              Phone Number ID: {connection.phoneNumberId}
              <br />
              Conectado em: {connection.connectedAt.toLocaleString("pt-BR")}
            </p>
            <form action={desconectarWhatsappAction.bind(null, organizationId)}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Desconectar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <p className="text-sm font-medium text-neutral-600">Nenhum WhatsApp conectado</p>
            </div>
            <ConnectWhatsappButton organizationId={organizationId} />
          </div>
        )}
      </div>
    </div>
  );
}
