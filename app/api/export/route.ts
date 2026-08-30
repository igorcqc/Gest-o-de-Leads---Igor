import { NextResponse } from "next/server";
import { bootstrapCrm } from "@/lib/crm";
import { contactToLead } from "@/lib/crm-mappers";

function cell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  try {
    const data = await bootstrapCrm();
    const header = ["Empresa", "Contato", "Telefone", "E-mail", "Instagram", "Cidade", "UF", "Nicho", "Funil", "Origem", "Etapa", "Temperatura", "Score", "Valor estimado", "Próxima ação", "Data da ação", "Campanha", "Conjunto", "Anúncio", "Motivo de perda", "Criado em"];
    const rows = data.contacts.map(contactToLead).map((lead) => [
      lead.nome, lead.contact_name, lead.telefone, lead.email, lead.instagram_handle,
      lead.cidade, lead.state, lead.niche, lead.pipeline, lead.source, lead.status,
      lead.temperature, lead.pain_score, lead.valor_estimado, lead.next_action_text,
      lead.proximo_followup, lead.campaign, lead.adset, lead.ad_name, lead.loss_reason, lead.created_at,
    ]);
    const csv = [header, ...rows].map((row) => row.map(cell).join(";")).join("\n");
    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="crm-protocolo-10k-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao exportar" }, { status: 500 });
  }
}
