import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { WhatsappTokenForm } from "./token-form";
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
        Conecte um número de WhatsApp Business dedicado a este sistema pra enviar
        automaticamente o link do boleto pro cliente (sempre que um boleto for gerado ou
        reemitido) e ver as conversas recebidas, com opção de responder por aqui.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                WABA ID: {connection.wabaId || "—"}
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
              <WhatsappTokenForm organizationId={organizationId} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-neutral-800">
            Como conseguir esses dados
          </h2>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-600">
            <li>
              Acesse{" "}
              <span className="font-medium text-neutral-800">business.facebook.com</span> →
              Configurações do Negócio → Usuários → Usuários do sistema.
            </li>
            <li>
              Clique em <span className="font-medium text-neutral-800">Adicionar</span>, dê um
              nome (ex: &quot;JHV Agrosystem&quot;) e defina a função como Admin.
            </li>
            <li>
              Selecione o usuário do sistema recém-criado → Adicionar ativos → escolha a Conta
              do WhatsApp Business (WABA) → conceda controle total.
            </li>
            <li>
              Clique em <span className="font-medium text-neutral-800">Gerar novo token</span>,
              selecione o app usado pra essa integração e marque as permissões{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                whatsapp_business_messaging
              </code>{" "}
              e{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                whatsapp_business_management
              </code>
              .
            </li>
            <li>
              Copie o token gerado (ele só aparece uma vez) e cole no campo{" "}
              <span className="font-medium text-neutral-800">Token de Acesso Permanente</span>{" "}
              ao lado.
            </li>
            <li>
              O <span className="font-medium text-neutral-800">Phone Number ID</span> e o{" "}
              <span className="font-medium text-neutral-800">WABA ID</span> ficam em WhatsApp
              Manager → Configuração da API (são códigos, não o número em si nem o nome da
              conta). O WABA ID é obrigatório — é ele que liga a conta ao envio automático das
              mensagens recebidas pro sistema.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
