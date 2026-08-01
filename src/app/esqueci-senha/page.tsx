import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function EsqueciSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image src="/JHV_logo.png" alt="JHV Agrosystem" width={280} height={86} priority unoptimized />
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Informe seu e-mail para receber um link de redefinição de senha
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
