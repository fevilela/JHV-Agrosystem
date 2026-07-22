"use client";

import { openDB, type DBSchema } from "idb";

interface OfflineDB extends DBSchema {
  "write-queue": {
    key: string;
    value: {
      id: string;
      endpoint: string;
      moduleLabel: string;
      payload: Record<string, string>;
      createdAt: number;
    };
  };
}

const DB_NAME = "jhv-offline";
const STORE = "write-queue";
export const QUEUE_CHANGED_EVENT = "jhv-offline-queue-changed";

function getDb() {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

function notifyQueueChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
  }
}

export async function enqueueWrite(item: {
  endpoint: string;
  moduleLabel: string;
  payload: Record<string, string>;
}) {
  const db = await getDb();
  const record = { id: crypto.randomUUID(), createdAt: Date.now(), ...item };
  await db.add(STORE, record);
  notifyQueueChanged();
  await registerBackgroundSync();
  return record.id;
}

export async function listQueue() {
  const db = await getDb();
  return db.getAll(STORE);
}

export async function countQueue() {
  const db = await getDb();
  return db.count(STORE);
}

async function removeFromQueue(id: string) {
  const db = await getDb();
  await db.delete(STORE, id);
}

async function registerBackgroundSync() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ("sync" in reg) {
      await (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register(
        "sync-write-queue"
      );
    }
  } catch {
    // Background Sync isn't available (e.g. Safari) — the "online" event
    // listener in offline-status.tsx covers the drain in that case.
  }
}

// Fallback drain for browsers without the Background Sync API, and to give
// immediate feedback right when connectivity comes back with the tab open.
export async function drainQueue() {
  const items = await listQueue();
  let drained = false;
  for (const item of items) {
    try {
      const res = await fetch(item.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
        credentials: "same-origin",
      });
      if (res.ok) {
        await removeFromQueue(item.id);
        drained = true;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  if (drained) notifyQueueChanged();
}
