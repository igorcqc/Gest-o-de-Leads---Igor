import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { authenticateCrmLogin, CRM_OWNER_EMAIL } from "@/lib/crm";
import { createHmac } from "node:crypto";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 400 });
  }

  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded ?? request.headers.get("x-real-ip") ?? "unknown";
    const fingerprint = createHmac("sha256", process.env.APP_SECRET ?? "local-development")
      .update(ip)
      .digest("hex");
    const auth = await authenticateCrmLogin(parsed.data.password, fingerprint);
    if (auth.locked) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
    }
    if (!auth.valid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = createSessionToken(parsed.data.password, CRM_OWNER_EMAIL);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao autenticar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
