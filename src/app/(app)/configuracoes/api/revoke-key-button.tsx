"use client";

import { useTranslations } from "next-intl";
import { DeleteButton } from "@/components/crud/delete-button";
import { revokeApiKeyAction } from "./actions";

export function RevokeKeyButton({ id }: { id: string }) {
  const t = useTranslations("configuracoes.api");
  return (
    <DeleteButton
      onDelete={() => revokeApiKeyAction(id)}
      title={t("revoke")}
      confirmLabel={t("confirmRevoke")}
      variant="cancel"
    />
  );
}
