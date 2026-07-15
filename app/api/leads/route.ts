import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { leadCreateSchema } from "@/lib/validations";
import { calcularProximoFollowup } from "@/lib/cadencia";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  let query = supabaseServer
    .from("leads")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const origem = searchParams.get("origem");
  if (origem) {
    query = query.in("origem", origem.split(","));
  }

  const status = searchParams.get("status");
  if (status) {
    query = query.in("status", status.split(","));
  }

  const cidade = searchParams.get("cidade");
  if (cidade) {
    query = query.ilike("cidade", `%${cidade}%`);
  }

  const scoreMin = searchParams.get("scoreMin");
  if (scoreMin) {
    query = query.gte("pain_score", Number(scoreMin));
  }

  const followup = searchParams.get("followup");
  if (followup) {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(inicioHoje);
    fimHoje.setDate(fimHoje.getDate() + 1);

    if (followup === "atrasado") {
      query = query
        .eq("followup_ativo", true)
        .lt("proximo_followup", inicioHoje.toISOString());
    } else if (followup === "hoje") {
      query = query
        .eq("followup_ativo", true)
        .gte("proximo_followup", inicioHoje.toISOString())
        .lt("proximo_followup", fimHoje.toISOString());
    } else if (followup === "proximos_7_dias") {
      const em7Dias = new Date(inicioHoje);
      em7Dias.setDate(em7Dias.getDate() + 7);
      query = query
        .eq("followup_ativo", true)
        .gte("proximo_followup", inicioHoje.toISOString())
        .lt("proximo_followup", em7Dias.toISOString());
    } else if (followup === "sem") {
      query = query.is("proximo_followup", null);
    }
  }

  const search = searchParams.get("search");
  if (search) {
    query = query.or(
      `nome.ilike.%${search}%,telefone.ilike.%${search}%,cidade.ilike.%${search}%,tags.cs.{${search}}`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = leadCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const status = parsed.data.status ?? "novo";
  const proximoFollowup = calcularProximoFollowup(status);

  const { data: lead, error } = await supabaseServer
    .from("leads")
    .insert({
      ...parsed.data,
      status,
      proximo_followup: proximoFollowup ? proximoFollowup.toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseServer.from("interacoes").insert({
    lead_id: lead.id,
    tipo: "nota",
    descricao: "Lead cadastrado",
  });

  return NextResponse.json({ lead }, { status: 201 });
}
