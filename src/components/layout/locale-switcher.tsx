"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/lib/locale-actions";

const OPTIONS = [
  { value: "pt-BR", label: "🇧🇷 Português" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "en", label: "🇬🇧 English" },
];

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={isPending}
      onChange={(e) => {
        const locale = e.target.value;
        startTransition(async () => {
          await setLocaleAction(locale);
          router.refresh();
        });
      }}
      className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-neutral-700 transition disabled:opacity-50"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
