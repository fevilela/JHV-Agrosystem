const SW_VERSION = "v3";
const STATIC_CACHE = `jhv-static-${SW_VERSION}`;
const PAGES_CACHE = `jhv-pages-${SW_VERSION}`;
const CURRENT_CACHES = [STATIC_CACHE, PAGES_CACHE];

// List pages that are worth keeping usable offline (field data-entry modules).
const OFFLINE_PAGE_PREFIXES = [
  "/pecuaria/pesagens",
  "/pecuaria/sanidade",
  "/agricultura/tratos-culturais",
  "/rh/ponto",
];

// cache.addAll() is all-or-nothing — one failed URL rejects everything and
// (since this runs inside install's waitUntil) aborts the whole service
// worker installation with no visible error. Every precache URL here is
// fetched and cached independently and best-effort instead, so a single
// hiccup can never prevent the service worker from installing.
async function precache(cache, url) {
  try {
    const response = await fetch(url);
    if (response.ok) await cache.put(url, response);
  } catch {
    // best-effort; runtime networkFirst()/cacheFirst() will fill this in
    // later on a successful request instead
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const pagesCache = await caches.open(PAGES_CACHE);

      await Promise.all([
        ...["/offline", "/manifest.webmanifest", "/JHV_icon.png"].map((url) => precache(staticCache, url)),
        ...OFFLINE_PAGE_PREFIXES.flatMap((prefix) => [prefix, `${prefix}/novo`]).map((url) =>
          precache(pagesCache, url)
        ),
      ]);

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline");
    return offline || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    if (OFFLINE_PAGE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      event.respondWith(networkFirst(request, PAGES_CACHE));
    } else {
      event.respondWith(
        fetch(request).catch(() => caches.match("/offline").then((cached) => cached || Response.error()))
      );
    }
  }
});

// Background Sync drain. Duplicated (vanilla indexedDB, not the `idb` lib
// used on the page side) because this handler must run even when no app tab
// is open, so it can't rely on the ESM import in src/lib/offline-queue.ts.
const DB_NAME = "jhv-offline";
const STORE = "write-queue";

function openQueueDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllQueueItems(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteQueueItem(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function drainQueueInWorker() {
  const db = await openQueueDb();
  const items = await getAllQueueItems(db);
  for (const item of items) {
    try {
      const res = await fetch(item.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
        credentials: "same-origin",
      });
      if (res.ok) {
        await deleteQueueItem(db, item.id);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  const clients = await self.clients.matchAll();
  for (const client of clients) client.postMessage({ type: "jhv-queue-drained" });
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-write-queue") {
    event.waitUntil(drainQueueInWorker());
  }
});
