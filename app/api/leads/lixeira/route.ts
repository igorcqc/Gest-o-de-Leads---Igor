import { NextResponse } from "next/server";
import { bootstrapCrm } from "@/lib/crm";
import { contactToLead } from "@/lib/crm-mappers";

export async function GET() {
  try {
    const data = await bootstrapCrm();
    return NextResponse.json({ leads: data.trash.map(contactToLead) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar lixeira" }, { status: 500 });
  }
}
