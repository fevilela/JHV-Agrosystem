"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, Clock, Check } from "lucide-react";
import { markNotificationReadAction, markAllNotificationsReadAction } from "./notification-actions";

type NotificationItem = {
  id: string;
  category: string;
  title: string;
  detail: string | null;
  href: string | null;
  severity: "VENCIDO" | "VENCENDO";
};

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-neutral-700">Notificações</span>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => markAllNotificationsReadAction())}
                className="flex items-center gap-1 text-xs text-brand-700 hover:underline disabled:opacity-50"
              >
                <Check size={12} />
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-400">
                Nenhuma notificação pendente.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-2.5 border-b border-neutral-50 px-4 py-3 last:border-0 hover:bg-neutral-50"
                >
                  {n.severity === "VENCIDO" ? (
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
                  ) : (
                    <Clock size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-400">{n.category}</p>
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="block truncate text-sm text-neutral-800 hover:underline"
                      >
                        {n.title}
                      </Link>
                    ) : (
                      <p className="truncate text-sm text-neutral-800">{n.title}</p>
                    )}
                    {n.detail && <p className="truncate text-xs text-neutral-500">{n.detail}</p>}
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    title="Marcar como lida"
                    onClick={() => startTransition(() => markNotificationReadAction(n.id))}
                    className="flex-shrink-0 rounded-md p-1 text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
