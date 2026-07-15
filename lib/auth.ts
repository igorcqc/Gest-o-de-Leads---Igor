import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const APP_SECRET = process.env.APP_SECRET!;
const COOKIE_NAME = "crm_session";
const TOKEN_TTL = "7d";

export async function verifyPassword(password: string): Promise<boolean> {
  const appPassword = process.env.APP_PASSWORD!;
  const hash = await bcrypt.hash(appPassword, 10);
  return bcrypt.compare(password, hash);
}

export function createSessionToken(): string {
  return jwt.sign({ sub: "igor" }, APP_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifySessionToken(token: string): boolean {
  try {
    jwt.verify(token, APP_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
