import { randomBytes, createHash } from "crypto";

const KEY_PREFIX = "jhv_live_";

export function generateApiKey(): { token: string; keyPrefix: string; keyHash: string } {
  const secret = randomBytes(24).toString("base64url");
  const token = `${KEY_PREFIX}${secret}`;
  return { token, keyPrefix: token.slice(0, KEY_PREFIX.length + 6), keyHash: hashApiKey(token) };
}

export function hashApiKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
