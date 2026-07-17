import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export async function Topbar() {
  const session = await auth();

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-6">
      <div className="text-right">
        <p className="text-sm font-medium leading-none text-neutral-900">
          {session?.user?.name}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {session?.user?.email}
        </p>
      </div>
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
    </header>
  );
}
