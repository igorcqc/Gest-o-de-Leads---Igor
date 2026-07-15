import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { calcularProximoFollowup } from "@/lib/cadencia";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  acao: z.enum(["concluir", "reagendar", "pausar", "reativar"]),
  data: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (parsed.data.acao === "concluir") {
    const { data: lead } = await supabaseServer
      .from("leads")
      .select("status")
      .eq("id", id)
      .single();

    const proximo = lead ? calcularProximoFollowup(lead.status) : null;
    updates.proximo_followup = proximo ? proximo.toISOString() : null;

    await supabaseServer.from("interacoes").insert({
      lead_id: id,
      tipo: "followup",
      descricao: "Follow-up marcado como feito",
    });
  } else if (parsed.data.acao === "reagendar" && parsed.data.data) {
    updates.proximo_followup = new Date(parsed.data.data).toISOString();
  } else if (parsed.data.acao === "pausar") {
    updates.followup_ativo = false;
  } else if (parsed.data.acao === "reativar") {
    updates.followup_ativo = true;
  }

  const { data: lead, error } = await supabaseServer
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: error?.message ?? "Lead não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
