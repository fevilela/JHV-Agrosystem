"use client";

import { Trash2, Ban, Check, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

const icons = { delete: Trash2, cancel: Ban };

export function DeleteButton({
  onDelete,
  confirmLabel = "Confirmar exclusão",
  variant = "delete",
  title = "Excluir",
}: {
  onDelete: () => Promise<void>;
  confirmLabel?: string;
  variant?: "delete" | "cancel";
  title?: string;
}) {
  const Icon = icons[variant];
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          title={confirmLabel}
          onClick={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            startTransition(() => {
              onDelete();
            });
          }}
          className="rounded-md bg-red-600 p-1.5 text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          title="Cancelar"
          onClick={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setConfirming(false);
          }}
          className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setConfirming(true);
        timeoutRef.current = setTimeout(() => setConfirming(false), 4000);
      }}
      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
      title={title}
    >
      <Icon size={16} />
    </button>
  );
}
