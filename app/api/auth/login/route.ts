import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

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
    const isValid = await verifyPassword(parsed.data.password);
    if (!isValid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = createSessionToken();
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
