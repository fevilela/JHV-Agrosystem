export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center">
      <h1 className="text-lg font-semibold text-neutral-900">Sem conexão</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        Esta página ainda não foi carregada com internet, então não está disponível offline.
        Reconecte e tente novamente.
      </p>
    </div>
  );
}
