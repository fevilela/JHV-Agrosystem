"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function SidebarToggleButton() {
  const { open, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      title={open ? "Fechar menu" : "Abrir menu"}
      className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
    >
      {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
    </button>
  );
}
