import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireOrg } from "@/lib/tenant";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization, isSuperAdmin } = await requireOrg();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar allowedModules={organization.allowedModules} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar isSuperAdmin={isSuperAdmin} />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
