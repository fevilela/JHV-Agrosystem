"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { countQueue, drainQueue, QUEUE_CHANGED_EVENT } from "@/lib/offline-queue";

export function OfflineStatusBadge() {
  const t = useTranslations("common");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // installable shell just won't be available this session
      });
    }

    setOnline(navigator.onLine);
    const refreshPending = () => countQueue().then(setPending);
    refreshPending();

    function handleOnline() {
      setOnline(true);
      drainQueue().then(refreshPending);
    }
    function handleOffline() {
      setOnline(false);
    }
    function handleQueueChanged() {
      refreshPending();
    }
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "jhv-queue-drained") refreshPending();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChanged);
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChanged);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
        !online
          ? "border-neutral-200 bg-neutral-50 text-neutral-500"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
      title={!online ? t("offline") : t("pendingSync", { count: pending })}
    >
      {!online ? <WifiOff size={14} /> : <RefreshCw size={14} />}
      <span className="hidden sm:inline">
        {!online ? t("offline") : t("pendingSync", { count: pending })}
      </span>
    </div>
  );
}
