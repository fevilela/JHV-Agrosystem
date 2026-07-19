import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/tenant";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationId } = await requireSuperAdmin();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-neutral-50">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-800">
          JHV Agrosystem — Painel Admin
        </Link>
        <div className="flex items-center gap-2">
          {organizationId && (
            <Link
              href="/"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
            >
              Voltar ao sistema
            </Link>
          )}
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
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
