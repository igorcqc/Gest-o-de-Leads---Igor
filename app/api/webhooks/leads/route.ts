import { NextRequest, NextResponse } from "next/server";
import { authenticateCrm, mutateCrmWithSecret } from "@/lib/crm";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

const payloadSchema = z.object({
  company: z.string().trim().optional(),
  contact_name: z.string().trim().optional(),
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  niche: z.string().trim().optional(),
  source: z.string().trim().optional(),
  campaign: z.string().trim().optional(),
  adset: z.string().trim().optional(),
  ad_name: z.string().trim().optional(),
  form_name: z.string().trim().optional(),
  external_lead_id: z.string().trim().optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  const configuredWebhookSecret = process.env.WEBHOOK_SECRET;
  const providedWebhookSecret = request.headers.get("x-webhook-secret");
  if (!configuredWebhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
  }
  const webhookAllowed = providedWebhookSecret
    && providedWebhookSecret.length === configuredWebhookSecret.length
    && timingSafeEqual(Buffer.from(providedWebhookSecret), Buffer.from(configuredWebhookSecret));
  if (!webhookAllowed) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const authorization = request.headers.get("authorization");
  const secret = request.headers.get("x-crm-api-secret") ?? authorization?.replace(/^Bearer\s+/i, "");
  if (!secret || !(await authenticateCrm(secret))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const input = parsed.data;
    const contact = await mutateCrmWithSecret(secret, "create_contact", {
      ...input,
      company: input.company ?? input.name ?? input.contact_name ?? "Lead de anúncio",
      contact_name: input.contact_name ?? input.name,
      source: input.source ?? "Anúncios",
      pipeline: "anuncios",
      stage: "Novo contato",
      prospect_status: "Não contatado",
      next_action_text: "Realizar primeiro contato",
      next_action_at: new Date().toISOString(),
      raw_payload: input,
    });
    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar lead" }, { status: 400 });
  }
}
