import { NextRequest, NextResponse } from "next/server";
import { bootstrapCrm, mutateCrm } from "@/lib/crm";
import { contactToLead, contactToLeadWithInteractions, leadPayloadToContact } from "@/lib/crm-mappers";
import { leadUpdateSchema } from "@/lib/validations";
import { calcularProximoFollowup } from "@/lib/cadencia";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const data = await bootstrapCrm();
    const contact = data.contacts.find((item) => String(item.id) === id);
    if (!contact) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    return NextResponse.json({ lead: contactToLeadWithInteractions(contact, data.activities) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar lead" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = leadUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.status === "perdido" && !parsed.data.loss_reason && !parsed.data.status_detalhado?.motivo) {
    return NextResponse.json({ error: "Informe o motivo da perda" }, { status: 400 });
  }
  try {
    const payload = leadPayloadToContact(parsed.data);
    payload.id = id;
    if (parsed.data.status && parsed.data.proximo_followup === undefined) {
      const date = calcularProximoFollowup(parsed.data.status);
      payload.next_action_at = date?.toISOString() ?? null;
    }
    const contact = await mutateCrm("update_contact", payload);
    return NextResponse.json({ lead: contactToLead(contact) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lead não encontrado" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const action = request.nextUrl.searchParams.get("permanent") === "true" ? "purge_contact" : "delete_contact";
    await mutateCrm(action, { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao excluir" }, { status: 400 });
  }
}
