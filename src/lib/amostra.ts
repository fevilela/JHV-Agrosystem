import type { AmostraStatus } from "@prisma/client";

export type StatusTransition = { next: AmostraStatus; label: string };

const STATUS_TRANSITIONS: Record<AmostraStatus, StatusTransition[]> = {
  RECEBIDA: [
    { next: "EM_ANALISE", label: "Iniciar Análise" },
    { next: "CANCELADA", label: "Cancelar" },
  ],
  EM_ANALISE: [
    { next: "CONCLUIDA", label: "Concluir" },
    { next: "CANCELADA", label: "Cancelar" },
  ],
  CONCLUIDA: [],
  CANCELADA: [],
};

export function getStatusTransitions(status: AmostraStatus): StatusTransition[] {
  return STATUS_TRANSITIONS[status];
}

export function isTerminalStatus(status: AmostraStatus): boolean {
  return getStatusTransitions(status).length === 0;
}
