import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { data: lead, error } = await supabaseServer
    .from("leads")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: error?.message ?? "Lead não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
