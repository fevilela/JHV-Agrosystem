"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

export function ExportButton({
  baseHref,
  label = "Exportar",
}: {
  baseHref: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
      >
        <Download size={16} />
        {label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <a
            href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}format=csv`}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            CSV
          </a>
          <a
            href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}format=xlsx`}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            Excel (.xlsx)
          </a>
        </div>
      )}
    </div>
  );
}
