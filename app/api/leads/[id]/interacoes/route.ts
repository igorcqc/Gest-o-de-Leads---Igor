import { NextRequest, NextResponse } from "next/server";
import { mutateCrm } from "@/lib/crm";
import { activityToInteraction } from "@/lib/crm-mappers";
import { interacaoCreateSchema } from "@/lib/validations";

interface RouteParams { params: Promise<{ id: string }> }

const TYPE_MAP: Record<string, string> = {
  dm_enviado: "instagram", followup: "follow_up", nota: "note",
  mudanca_status: "stage_change", call: "call", reuniao: "meeting",
  proposta: "proposal", outro: "other",
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = interacaoCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const activity = await mutateCrm("add_activity", {
      contact_id: id,
      activity_type: parsed.data.canal ?? TYPE_MAP[parsed.data.tipo] ?? "note",
      title: parsed.data.tipo === "nota" ? "Anotação registrada" : "Interação registrada",
      content: parsed.data.descricao,
      metadata: { tipo: parsed.data.tipo, canal: parsed.data.canal },
    });
    return NextResponse.json({ interacao: activityToInteraction(activity) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao registrar interação" }, { status: 400 });
  }
}
