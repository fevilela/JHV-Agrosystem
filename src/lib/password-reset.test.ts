import { describe, it, expect } from "vitest";
import { avaliarToken, calcularExpiracao, INVITE_TOKEN_EXPIRY_DAYS, RESET_TOKEN_EXPIRY_HOURS } from "./password-reset";

describe("avaliarToken", () => {
  const now = new Date("2026-08-01T12:00:00.000Z");

  it("is nao_encontrado when there's no matching record", () => {
    expect(avaliarToken(null, now)).toEqual({ ok: false, error: "nao_encontrado" });
  });

  it("is ja_usado when the token was already consumed, even if not expired", () => {
    const record = { usedAt: new Date("2026-07-31T00:00:00.000Z"), expiresAt: new Date("2026-08-10T00:00:00.000Z") };
    expect(avaliarToken(record, now)).toEqual({ ok: false, error: "ja_usado" });
  });

  it("is expirado when the deadline already passed and it was never used", () => {
    const record = { usedAt: null, expiresAt: new Date("2026-07-31T00:00:00.000Z") };
    expect(avaliarToken(record, now)).toEqual({ ok: false, error: "expirado" });
  });

  it("is ok when unused and still within the deadline", () => {
    const record = { usedAt: null, expiresAt: new Date("2026-08-10T00:00:00.000Z") };
    expect(avaliarToken(record, now)).toEqual({ ok: true });
  });
});

describe("calcularExpiracao", () => {
  const now = new Date("2026-08-01T12:00:00.000Z");

  it("expires an INVITE token after INVITE_TOKEN_EXPIRY_DAYS days", () => {
    const expected = new Date(now);
    expected.setDate(expected.getDate() + INVITE_TOKEN_EXPIRY_DAYS);
    expect(calcularExpiracao("INVITE", now)).toEqual(expected);
  });

  it("expires a RESET token after RESET_TOKEN_EXPIRY_HOURS hours", () => {
    const expected = new Date(now);
    expected.setHours(expected.getHours() + RESET_TOKEN_EXPIRY_HOURS);
    expect(calcularExpiracao("RESET", now)).toEqual(expected);
  });
});
