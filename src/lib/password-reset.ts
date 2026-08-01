import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { PasswordResetTokenKind } from "@prisma/client";

export const INVITE_TOKEN_EXPIRY_DAYS = 7;
export const RESET_TOKEN_EXPIRY_HOURS = 1;

export function buildResetLink(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "";
  return `${baseUrl}/redefinir-senha/${token}`;
}

export function calcularExpiracao(kind: PasswordResetTokenKind, now: Date = new Date()): Date {
  const expiresAt = new Date(now);
  if (kind === "INVITE") {
    expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);
  } else {
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);
  }
  return expiresAt;
}

export type TokenErro = "nao_encontrado" | "expirado" | "ja_usado";

export type TokenRecordLike = {
  usedAt: Date | null;
  expiresAt: Date;
};

// Pura — separada do acesso ao banco pra dar pra testar as 3 mensagens de erro
// (não encontrado / expirado / já usado) sem precisar de um Prisma de verdade.
export function avaliarToken(
  record: TokenRecordLike | null,
  now: Date = new Date()
): { ok: true } | { ok: false; error: TokenErro } {
  if (!record) return { ok: false, error: "nao_encontrado" };
  if (record.usedAt) return { ok: false, error: "ja_usado" };
  if (record.expiresAt < now) return { ok: false, error: "expirado" };
  return { ok: true };
}

export async function criarTokenSenha(userId: string, kind: PasswordResetTokenKind) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = calcularExpiracao(kind);

  await prisma.passwordResetToken.create({
    data: { userId, token, kind, expiresAt },
  });

  return { token, link: buildResetLink(token) };
}

type ValidarTokenResult =
  | { ok: true; userId: string; kind: PasswordResetTokenKind }
  | { ok: false; error: TokenErro };

export async function validarToken(token: string): Promise<ValidarTokenResult> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  const avaliacao = avaliarToken(record);
  if (!avaliacao.ok) return avaliacao;
  return { ok: true, userId: record!.userId, kind: record!.kind };
}

export async function consumirToken(
  token: string,
  novaSenha: string
): Promise<{ ok: true } | { ok: false; error: TokenErro }> {
  const resultado = await validarToken(token);
  if (!resultado.ok) return resultado;

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resultado.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true };
}
