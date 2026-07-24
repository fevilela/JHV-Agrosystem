import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocaleSwitcher } from "./locale-switcher";
import { NotificationBell } from "./notification-bell";
import { OfflineStatusBadge } from "./offline-status";
import { PushOptIn } from "./push-opt-in";
import { SidebarToggleButton } from "./sidebar-toggle-button";

export async function Topbar({
  isSuperAdmin,
  organizationId,
}: {
  isSuperAdmin?: boolean;
  organizationId: string;
}) {
  const session = await auth();
  const locale = await getLocale();
  const notifications = await prisma.notification.findMany({
    where: { organizationId, read: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const unreadCount = await prisma.notification.count({
    where: { organizationId, read: false },
  });
  const name = session?.user?.name || "";
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-4">
      <SidebarToggleButton />
      <div className="flex flex-1 items-center justify-end gap-3">
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-brand-800 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
          >
            Painel JHV
          </Link>
        )}
        <OfflineStatusBadge />
        <PushOptIn />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800">
            {initials}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium leading-none text-neutral-900">
              {session?.user?.name}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <LocaleSwitcher current={locale} />
        <form
          action={async () => {
            "use server";
            await signOut({ redirect: false });
            redirect("/login");
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
