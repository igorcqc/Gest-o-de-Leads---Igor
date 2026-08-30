import { NextRequest, NextResponse } from "next/server";
import { bootstrapCrm, mutateCrm } from "@/lib/crm";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["create_list", "import_contacts", "create_task", "complete_task", "update_settings"]),
  payload: z.record(z.unknown()).default({}),
});

export async function GET() {
  try {
    return NextResponse.json(await bootstrapCrm());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar CRM" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const result = await mutateCrm(parsed.data.action, parsed.data.payload);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar CRM" }, { status: 400 });
  }
}
