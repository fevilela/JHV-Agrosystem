// Keep this list in sync with OFFLINE_PAGE_PREFIXES in public/sw.js — the
// service worker can't import this file since it isn't part of the app's
// module graph.
export const OFFLINE_PAGE_PREFIXES = [
  "/pecuaria/pesagens",
  "/pecuaria/sanidade",
  "/agricultura/tratos-culturais",
  "/rh/ponto",
];
