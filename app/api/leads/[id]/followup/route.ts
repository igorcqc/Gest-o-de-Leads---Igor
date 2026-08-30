import { NextRequest, NextResponse } from "next/server";
import { bootstrapCrm, mutateCrm } from "@/lib/crm";
import { contactToLead } from "@/lib/crm-mappers";
import { calcularProximoFollowup } from "@/lib/cadencia";
import { z } from "zod";

interface RouteParams { params: Promise<{ id: string }> }
const bodySchema = z.object({ acao: z.enum(["concluir", "reagendar", "pausar", "reativar"]), data: z.string().optional() });

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const data = await bootstrapCrm();
    const current = data.contacts.find((item) => String(item.id) === id);
    if (!current) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    const lead = contactToLead(current);
    const payload: Record<string, unknown> = { id };
    if (parsed.data.acao === "concluir") {
      const next = calcularProximoFollowup(lead.status);
      payload.next_action_at = next?.toISOString() ?? null;
      payload.last_contact_at = new Date().toISOString();
      await mutateCrm("add_activity", { contact_id: id, activity_type: "follow_up", title: "Follow-up concluído", content: "Follow-up marcado como realizado" });
    } else if (parsed.data.acao === "reagendar") payload.next_action_at = parsed.data.data ?? null;
    else if (parsed.data.acao === "pausar") payload.next_action_at = null;
    else payload.next_action_at = calcularProximoFollowup(lead.status)?.toISOString() ?? null;
    const updated = await mutateCrm("update_contact", payload);
    return NextResponse.json({ lead: contactToLead(updated) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar follow-up" }, { status: 400 });
  }
}
