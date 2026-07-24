"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "jhv-sidebar-open";

type SidebarContextValue = { open: boolean; toggle: () => void; close: () => void };

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setOpen(stored === "1");
      return;
    }
    // First visit, no saved preference yet: default to closed on small
    // screens so the drawer doesn't cover the whole page on first load.
    if (window.matchMedia("(max-width: 767px)").matches) setOpen(false);
  }, []);

  function setAndStore(next: boolean) {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function close() {
    setAndStore(false);
  }

  return <SidebarContext.Provider value={{ open, toggle, close }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
