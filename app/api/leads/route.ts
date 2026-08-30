import { NextRequest, NextResponse } from "next/server";
import { bootstrapCrm, mutateCrm } from "@/lib/crm";
import { contactToLead, leadPayloadToContact } from "@/lib/crm-mappers";
import { leadCreateSchema } from "@/lib/validations";
import { calcularProximoFollowup } from "@/lib/cadencia";

export async function GET(request: NextRequest) {
  try {
    const data = await bootstrapCrm();
    let leads = data.contacts.map(contactToLead);
    const params = request.nextUrl.searchParams;
    const origem = params.get("origem")?.split(",");
    const status = params.get("status")?.split(",");
    const cidade = params.get("cidade")?.toLocaleLowerCase("pt-BR");
    const search = params.get("search")?.toLocaleLowerCase("pt-BR");
    const scoreMin = Number(params.get("scoreMin") ?? 0);
    const followup = params.get("followup");
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    leads = leads.filter((lead) => {
      if (origem?.length && !origem.includes(lead.origem)) return false;
      if (status?.length && !status.includes(lead.status)) return false;
      if (cidade && !lead.cidade?.toLocaleLowerCase("pt-BR").includes(cidade)) return false;
      if ((lead.pain_score ?? 0) < scoreMin) return false;
      if (search) {
        const haystack = [lead.nome, lead.contact_name, lead.telefone, lead.email, lead.cidade, lead.instagram_handle, ...lead.tags]
          .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
        if (!haystack.includes(search)) return false;
      }
      if (followup) {
        const date = lead.proximo_followup ? new Date(lead.proximo_followup) : null;
        if (followup === "atrasado" && (!date || date >= start)) return false;
        if (followup === "hoje" && (!date || date < start || date >= end)) return false;
        if (followup === "sem" && date) return false;
        if (followup === "proximos_7_dias") {
          const seven = new Date(start);
          seven.setDate(seven.getDate() + 7);
          if (!date || date < start || date >= seven) return false;
        }
      }
      return true;
    });
    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const status = parsed.data.status ?? "novo";
    const payload = leadPayloadToContact({ ...parsed.data, status });
    if (!payload.next_action_at) {
      const date = calcularProximoFollowup(status);
      payload.next_action_at = date?.toISOString() ?? null;
      payload.next_action_text = "Realizar próximo contato";
    }
    const contact = await mutateCrm("create_contact", payload);
    return NextResponse.json({ lead: contactToLead(contact) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao cadastrar lead" }, { status: 400 });
  }
}
