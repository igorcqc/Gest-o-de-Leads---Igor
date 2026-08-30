import { NextResponse } from "next/server";
import { bootstrapCrm } from "@/lib/crm";
import { contactToLead } from "@/lib/crm-mappers";
import { STATUS_ORDER } from "@/lib/types";

export async function GET() {
  try {
    const data = await bootstrapCrm();
    const leads = data.contacts.map(contactToLead);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(start); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const active = leads.filter((lead) => !["fechado", "perdido"].includes(lead.status));
    const due = (lead: (typeof leads)[number]) => lead.proximo_followup ? new Date(lead.proximo_followup) : null;
    const overdue = active.filter((lead) => { const date = due(lead); return date && date < start; });
    const today = active.filter((lead) => { const date = due(lead); return date && date >= start && date < end; });
    const stale = active.filter((lead) => new Date(lead.last_contact_at ?? lead.updated_at) < sevenDaysAgo).slice(0, 20);
    const newToday = leads.filter((lead) => new Date(lead.created_at) >= start).length;
    const followupsToday = data.activities.filter((item) => {
      const occurredAt = new Date(String(item.occurred_at ?? item.created_at));
      return String(item.activity_type) === "follow_up" && occurredAt >= start && occurredAt < end;
    }).length;
    const meetings = data.tasks.filter((item) => String(item.task_type) === "meeting" && item.due_at && new Date(String(item.due_at)) >= start && new Date(String(item.due_at)) < end);
    const createdThisMonth = leads.filter((lead) => new Date(lead.created_at) >= month);
    const wonThisMonth = leads.filter((lead) => lead.status === "fechado" && new Date(lead.updated_at) >= month);
    const rate = createdThisMonth.length ? Math.round((wonThisMonth.length / createdThisMonth.length) * 1000) / 10 : 0;
    const settings = data.settings ?? {};
    const targetNew = Number(settings.daily_new_contacts_target ?? 30);
    const targetFollowups = Number(settings.daily_followups_target ?? 5);
    const slaTarget = Number(settings.sla_target_minutes ?? 15);
    const waiting = leads.filter((lead) => lead.pipeline === "anuncios" && !lead.first_contact_at && !["fechado", "perdido"].includes(lead.status));
    const slaBreaches = waiting.filter((lead) => (now.getTime() - new Date(lead.created_at).getTime()) / 60000 > slaTarget).length;

    return NextResponse.json({
      hoje: {
        atrasados: overdue, hoje: today, reativar: stale,
        calls: meetings.map((task) => ({ id: task.id, lead_id: task.contact_id, tipo: "reuniao", descricao: task.title, created_at: task.due_at, leads: task.contact_id ? { id: task.contact_id, nome: task.company ?? "Lead", cidade: null, telefone: null } : null })),
        novosHoje: newToday, followupsFeitos: followupsToday, metaNovos: targetNew, metaFollowups: targetFollowups,
        aguardandoPrimeiroContato: waiting.length, slaEstourado: slaBreaches, slaMinutos: slaTarget,
      },
      kpis: {
        leadsAtivos: active.length, clientesAtivos: leads.filter((lead) => lead.status === "fechado").length,
        taxaConversao: rate, pipelineMrr: active.reduce((sum, lead) => sum + (lead.valor_estimado ?? 0), 0),
        funilDoMes: STATUS_ORDER.map((status) => ({ status, total: createdThisMonth.filter((lead) => lead.status === status).length })),
      },
      atividadeRecente: data.activities.slice(0, 12).map((item) => ({ id: item.id, tipo: item.activity_type, descricao: item.content ?? item.title, created_at: item.occurred_at ?? item.created_at, leads: item.contact_id ? { id: item.contact_id, nome: item.company ?? "Lead" } : null })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar dashboard" }, { status: 500 });
  }
}
