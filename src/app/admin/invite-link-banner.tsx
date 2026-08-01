"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const statusMessages: Record<string, string> = {
  sent: "E-mail enviado. Se preferir, você também pode copiar o link abaixo e mandar direto pro cliente.",
  skipped:
    "Essa organização ainda não tem e-mail (Resend) configurado — copie o link abaixo e envie pro cliente manualmente (WhatsApp, etc.).",
  error:
    "Não foi possível enviar o e-mail automaticamente — copie o link abaixo e envie pro cliente manualmente.",
};

export function InviteLinkBanner({
  link,
  email,
  status,
}: {
  link: string;
  email: string;
  status: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="mb-1 text-sm font-medium text-amber-900">Link de acesso para {email}</p>
      <p className="mb-3 text-xs text-amber-800">
        {statusMessages[status] ?? statusMessages.skipped}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 text-xs text-neutral-800">
          {link}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
