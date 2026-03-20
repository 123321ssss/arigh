import { createHash, randomBytes } from "node:crypto";

import { decryptJson, encryptJson } from "@/lib/security/crypto";

export function generateInviteCode() {
  return `invite_${randomBytes(9).toString("base64url")}`;
}

export function hashInviteCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function buildInviteCodePreview(code: string) {
  const compact = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length <= 10) {
    return compact;
  }

  return `${compact.slice(0, 8)}...${compact.slice(-4)}`;
}

export function encryptInviteCode(code: string) {
  return encryptJson({ code });
}

export function decryptInviteCode(encryptedCode: string) {
  const payload = decryptJson<{ code: string }>(encryptedCode);
  return payload.code;
}
