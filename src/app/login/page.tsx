import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
            <Image src="/logo-mark.svg" alt="JHV Agrosystem" width={64} height={64} priority />
          </div>
          <h1 className="text-2xl font-semibold text-brand-900">
            JHV Agrosystem
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl || "/"} />
      </div>
    </div>
  );
}
