import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "crm_session";
const TOKEN_TTL = "7d";

function getAppSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw new Error("APP_SECRET não configurado nas variáveis de ambiente.");
  }
  return secret;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    throw new Error("APP_PASSWORD não configurado nas variáveis de ambiente.");
  }
  const hash = await bcrypt.hash(appPassword, 10);
  return bcrypt.compare(password, hash);
}

export function createSessionToken(): string {
  return jwt.sign({ sub: "igor" }, getAppSecret(), { expiresIn: TOKEN_TTL });
}

export function verifySessionToken(token: string): boolean {
  try {
    jwt.verify(token, getAppSecret());
    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
