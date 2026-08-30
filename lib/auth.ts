import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const COOKIE_NAME = "crm_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const VERSION = "v1";

function getAppSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("APP_SECRET não configurado ou muito curto.");
  }
  return secret;
}

function encryptionKey() {
  return createHash("sha256").update(getAppSecret()).digest();
}

export interface SessionPayload {
  sub: "igor";
  ownerEmail: string;
  apiSecret: string;
  exp: number;
}

export function createSessionToken(apiSecret: string, ownerEmail: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const payload: SessionPayload = {
    sub: "igor",
    ownerEmail,
    apiSecret,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function getSessionPayload(token: string): SessionPayload | null {
  try {
    const [version, ivText, tagText, encryptedText] = token.split(".");
    if (version !== VERSION || !ivText || !tagText || !encryptedText) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(plaintext) as Partial<SessionPayload>;
    if (
      payload.sub !== "igor" ||
      typeof payload.ownerEmail !== "string" ||
      typeof payload.apiSecret !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function verifySessionToken(token: string): boolean {
  return getSessionPayload(token) !== null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
