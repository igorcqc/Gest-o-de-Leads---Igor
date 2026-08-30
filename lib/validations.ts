import { z } from "zod";

export const origemSchema = z.enum([
  "anuncio",
  "prospeccao_instagram",
  "indicacao",
  "organico",
]);

export const statusSchema = z.enum([
  "novo",
  "em_contato",
  "respondeu",
  "qualificado",
  "reuniao",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
]);

export const ambienteSchema = z.enum([
  "cozinha",
  "quarto",
  "escritorio",
  "closet",
  "sala",
  "gourmet",
  "banheiro",
  "lavanderia",
  "varios",
]);

export const etapaObraSchema = z.enum(["sonhando", "planejando", "em_obra", "pronta"]);

export const prazoSchema = z.enum(["imediato", "30_dias", "60_90_dias", "sem_pressa"]);

export const tamanhoLojaSchema = z.enum(["1_loja", "2_3_lojas", "4_mais_lojas"]);

export const tipoInteracaoSchema = z.enum([
  "dm_enviado",
  "followup",
  "nota",
  "mudanca_status",
  "call",
  "reuniao",
  "proposta",
  "outro",
]);

export const canalInteracaoSchema = z.enum([
  "instagram",
  "whatsapp",
  "telefone",
  "email",
  "presencial",
  "outro",
]);

export const leadCreateSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  telefone: z.string().trim().optional().nullable(),
  cidade: z.string().trim().optional().nullable(),
  origem: origemSchema,
  status: statusSchema.optional(),
  ambiente: ambienteSchema.optional().nullable(),
  valor_estimado: z.coerce.number().nonnegative().optional().nullable(),
  etapa_obra: etapaObraSchema.optional().nullable(),
  prazo: prazoSchema.optional().nullable(),
  dor_principal: z.string().trim().optional().nullable(),
  gargalo: z.string().trim().optional().nullable(),
  ja_investe_ads: z.boolean().optional(),
  tamanho_loja: tamanhoLojaSchema.optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
  tags: z.array(z.string()).optional(),
  pain_score: z.coerce.number().int().min(0).max(10).optional().nullable(),
  proximo_followup: z.string().optional().nullable(),
  followup_ativo: z.boolean().optional(),
  instagram_handle: z.string().trim().optional().nullable(),
  contact_name: z.string().trim().optional().nullable(),
  email: z.string().trim().email("E-mail inválido").optional().nullable().or(z.literal("")),
  state: z.string().trim().max(2).optional().nullable(),
  niche: z.string().trim().optional().nullable(),
  pipeline: z.enum(["prospeccao", "anuncios"]).optional(),
  source: z.string().trim().optional().nullable(),
  prospect_status: z.string().trim().optional().nullable(),
  temperature: z.enum(["Quente", "Morno", "Frio"]).optional(),
  next_action_text: z.string().trim().optional().nullable(),
  campaign: z.string().trim().optional().nullable(),
  adset: z.string().trim().optional().nullable(),
  ad_name: z.string().trim().optional().nullable(),
  form_name: z.string().trim().optional().nullable(),
  utm_source: z.string().trim().optional().nullable(),
  utm_medium: z.string().trim().optional().nullable(),
  utm_campaign: z.string().trim().optional().nullable(),
  utm_content: z.string().trim().optional().nullable(),
  list_id: z.string().uuid().optional().nullable().or(z.literal("")),
  loss_reason: z.string().trim().optional().nullable(),
});

export const leadUpdateSchema = leadCreateSchema.partial().extend({
  status_detalhado: z
    .object({
      data: z.string().optional(),
      valor_final: z.coerce.number().optional(),
      motivo: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export const interacaoCreateSchema = z.object({
  tipo: tipoInteracaoSchema,
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  canal: canalInteracaoSchema.optional().nullable(),
});
