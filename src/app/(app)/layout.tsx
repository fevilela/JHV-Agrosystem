import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { requireOrg } from "@/lib/tenant";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { effectiveModules, isSuperAdmin, organizationId } = await requireOrg();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar allowedModules={effectiveModules} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar isSuperAdmin={isSuperAdmin} organizationId={organizationId} />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
