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
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image src="/JHV_logo.png" alt="JHV Agrosystem" width={280} height={86} priority unoptimized />
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl || "/"} />
      </div>
    </div>
  );
}
