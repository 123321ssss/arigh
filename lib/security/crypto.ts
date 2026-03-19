import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

const IV_LENGTH = 12;

function getKey() {
  return createHash("sha256").update(env.APP_ENCRYPTION_SECRET).digest();
}

export function encryptJson(value: unknown) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encoded = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encoded]).toString("base64");
}

export function decryptJson<T>(value: string) {
  const raw = Buffer.from(value, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = raw.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);

  const decoded = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decoded.toString("utf8")) as T;
}
