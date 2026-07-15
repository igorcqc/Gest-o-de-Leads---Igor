import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { leadUpdateSchema } from "@/lib/validations";
import { calcularProximoFollowup } from "@/lib/cadencia";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { data: lead, error } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  const { data: interacoes } = await supabaseServer
    .from("interacoes")
    .select("*")
    .eq("lead_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return NextResponse.json({ lead: { ...lead, interacoes: interacoes ?? [] } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = leadUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status) {
    const { data: current } = await supabaseServer
      .from("leads")
      .select("status")
      .eq("id", id)
      .single();

    if (current && current.status !== parsed.data.status) {
      const proximoFollowup = calcularProximoFollowup(parsed.data.status);
      updates.proximo_followup = proximoFollowup ? proximoFollowup.toISOString() : null;
    }
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const permanent = request.nextUrl.searchParams.get("permanent") === "true";

  if (permanent) {
    const { error } = await supabaseServer.from("leads").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const { data: lead, error } = await supabaseServer
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: error?.message ?? "Lead não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
