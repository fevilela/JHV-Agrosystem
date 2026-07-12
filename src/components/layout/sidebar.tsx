"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navGroups } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(
    navGroups.find((g) => g.items?.some((i) => pathname.startsWith(i.href)))
      ?.label ?? "Cadastro"
  );

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
          <Image src="/logo-mark.svg" alt="JHV Agrosystem" width={36} height={36} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-neutral-900">
            JHV Agrosystem
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">Gestão Agropecuária</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map((group) => {
          const isOpen = openGroup === group.label;
          const isGroupActive = group.items?.some((i) =>
            pathname.startsWith(i.href)
          );

          return (
            <div key={group.label} className="mb-1">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  isGroupActive
                    ? "text-brand-800"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {group.label}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && group.items && (
                <ul className="mt-1 space-y-0.5 border-l border-neutral-200 pl-3">
                  {group.items.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block rounded-md px-3 py-1.5 text-sm transition ${
                            active
                              ? "bg-brand-50 font-medium text-brand-800"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
