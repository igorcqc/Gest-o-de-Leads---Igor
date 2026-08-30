import { NextRequest, NextResponse } from "next/server";
import { mutateCrm } from "@/lib/crm";
import { contactToLead } from "@/lib/crm-mappers";

interface RouteParams { params: Promise<{ id: string }> }
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const contact = await mutateCrm("restore_contact", { id });
    return NextResponse.json({ lead: contactToLead(contact) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao restaurar" }, { status: 400 });
  }
}
