export function isPrazoVencido(
  prazoResolucao: Date | string | null | undefined,
  status: string,
  now: Date
): boolean {
  if (!prazoResolucao || status === "RESOLVIDA") return false;
  return new Date(prazoResolucao) < now;
}
