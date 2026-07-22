"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { navGroups, ALWAYS_ON_MODULES } from "@/lib/nav";
import { OFFLINE_PAGE_PREFIXES } from "@/lib/offline-pages";

function navItemKey(href: string) {
  const last = href.split("/").filter(Boolean).pop() ?? "";
  return last.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function Sidebar({ allowedModules }: { allowedModules: string[] }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const visibleGroups = navGroups.filter(
    (g) => ALWAYS_ON_MODULES.includes(g.key) || allowedModules.includes(g.key)
  );
  const [openGroup, setOpenGroup] = useState<string | null>(
    visibleGroups.find((g) => g.items?.some((i) => pathname.startsWith(i.href)))
      ?.key ?? "cadastro"
  );

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-neutral-200/80 bg-white">
      <div className="flex items-center justify-center border-b border-neutral-100 px-4 py-5">
        <Image src="/JHV_icon.png" alt="JHV Agrosystem" width={40} height={40} unoptimized priority />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {visibleGroups.map((group) => {
          const isOpen = openGroup === group.key;
          const isGroupActive = group.items?.some((i) =>
            pathname.startsWith(i.href)
          );

          return (
            <div key={group.key} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.key)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  isGroupActive
                    ? "text-brand-800"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {t(`${group.key}.group`)}
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
                    const linkClassName = `relative block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                      active
                        ? "bg-brand-50 font-medium text-brand-800"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                    }`;
                    const label = (
                      <>
                        {active && (
                          <span className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-600" />
                        )}
                        {t(`${group.key}.items.${navItemKey(item.href)}`)}
                      </>
                    );
                    // Client-side <Link> transitions fetch the RSC payload,
                    // which the service worker doesn't cache — only a real
                    // browser navigation (request.mode "navigate") hits the
                    // cached-page fallback. Always force that for these 4
                    // offline-capable pages rather than trying to detect
                    // offline state first — navigator.onLine/'offline'
                    // events are unreliable in practice (confirmed: they
                    // stayed "online" during real Wi-Fi-off testing), so
                    // any online/offline check here would silently defeat
                    // this fix the same way it defeated the form's.
                    const forceFullNavigation = OFFLINE_PAGE_PREFIXES.some((p) => item.href.startsWith(p));
                    return (
                      <li key={item.href}>
                        {forceFullNavigation ? (
                          <a href={item.href} className={linkClassName}>
                            {label}
                          </a>
                        ) : (
                          <Link href={item.href} className={linkClassName}>
                            {label}
                          </Link>
                        )}
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
