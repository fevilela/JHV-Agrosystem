"use client";

import { useEffect, useState } from "react";
import { BellPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { subscribeToPushAction } from "./push-actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function PushOptIn() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((existing) => setVisible(!existing))
      .catch(() => {});
  }, []);

  async function handleEnable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setVisible(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await subscribeToPushAction(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setVisible(false);
    } catch {
      // best-effort; the bell in-app already covers notifications either way
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleEnable}
      disabled={busy}
      title={t("enableNotifications")}
      className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50"
    >
      <BellPlus size={14} />
      <span className="hidden sm:inline">{busy ? t("enablingNotifications") : t("enableNotifications")}</span>
    </button>
  );
}
