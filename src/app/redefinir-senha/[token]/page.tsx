import Image from "next/image";
import Link from "next/link";
import { validarToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

const errorMessages: Record<string, string> = {
  nao_encontrado: "Esse link de redefinição de senha não é válido.",
  expirado: "Esse link de redefinição de senha expirou. Peça um novo.",
  ja_usado: "Esse link já foi usado. Peça um novo se ainda precisar redefinir a senha.",
};

export default async function RedefinirSenhaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resultado = await validarToken(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image src="/JHV_logo.png" alt="JHV Agrosystem" width={280} height={86} priority unoptimized />
          </div>
          <p className="mt-1 text-sm text-neutral-500">Defina sua senha de acesso</p>
        </div>

        {resultado.ok ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-7 text-center">
            <p className="text-sm text-red-700">{errorMessages[resultado.error]}</p>
            <Link
              href="/esqueci-senha"
              className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
