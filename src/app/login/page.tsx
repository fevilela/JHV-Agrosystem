import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; senhaRedefinida?: string }>;
}) {
  const { callbackUrl, senhaRedefinida } = await searchParams;

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

        {senhaRedefinida && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-700">
            Senha definida com sucesso. Faça login com sua nova senha.
          </p>
        )}

        <LoginForm callbackUrl={callbackUrl || "/"} />

        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/esqueci-senha" className="font-medium text-brand-700 hover:text-brand-800">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </div>
  );
}
