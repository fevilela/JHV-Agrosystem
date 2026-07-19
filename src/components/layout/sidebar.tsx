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
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-neutral-200/80 bg-white">
      <div className="flex items-center justify-center border-b border-neutral-100 px-4 py-5">
        <Image src="/JHV_icon.png" alt="JHV Agrosystem" width={40} height={40} unoptimized priority />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group) => {
          const isOpen = openGroup === group.label;
          const isGroupActive = group.items?.some((i) =>
            pathname.startsWith(i.href)
          );

          return (
            <div key={group.label} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  isGroupActive
                    ? "text-brand-800"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {group.label}
                <ChevronDown
                  size={15}
                  className={`text-neutral-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && group.items && (
                <ul className="mt-0.5 mb-1 space-y-0.5 border-l border-neutral-100 pl-3">
                  {group.items.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`relative block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                            active
                              ? "bg-brand-50 font-medium text-brand-800"
                              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                          }`}
                        >
                          {active && (
                            <span className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-600" />
                          )}
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
