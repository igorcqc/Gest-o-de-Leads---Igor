import type {
  Interacao,
  Lead,
  LeadWithInteracoes,
  OrigemLead,
  StatusLead,
  TipoInteracao,
} from "@/lib/types";

type UnknownRecord = Record<string, unknown>;

const STAGE_TO_STATUS: Record<string, StatusLead> = {
  "Novo contato": "novo",
  "Em contato": "em_contato",
  Respondeu: "respondeu",
  Qualificado: "qualificado",
  Reunião: "reuniao",
  Proposta: "proposta",
  Negociação: "negociacao",
  Fechado: "fechado",
  Perdido: "perdido",
};

export const STATUS_TO_STAGE: Record<StatusLead, string> = {
  novo: "Novo contato",
  em_contato: "Em contato",
  respondeu: "Respondeu",
  qualificado: "Qualificado",
  reuniao: "Reunião",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

const ORIGIN_TO_SOURCE: Record<OrigemLead, string> = {
  anuncio: "Anúncios",
  prospeccao_instagram: "Prospecção ativa",
  indicacao: "Indicação",
  organico: "Orgânico",
};

function sourceToOrigin(source: unknown): OrigemLead {
  const value = String(source ?? "").toLocaleLowerCase("pt-BR");
  if (value.includes("anún") || value.includes("meta") || value.includes("google")) return "anuncio";
  if (value.includes("indica")) return "indicacao";
  if (value.includes("orgân") || value.includes("organic")) return "organico";
  return "prospeccao_instagram";
}

function qualificationOf(contact: UnknownRecord): UnknownRecord {
  return contact.qualification && typeof contact.qualification === "object"
    ? (contact.qualification as UnknownRecord)
    : {};
}

export function contactToLead(contact: UnknownRecord): Lead {
  const qualification = qualificationOf(contact);
  return {
    id: String(contact.id),
    nome: String(contact.company ?? contact.contact_name ?? "Contato sem nome"),
    telefone: contact.phone ? String(contact.phone) : null,
    cidade: contact.city ? String(contact.city) : null,
    origem: sourceToOrigin(contact.source),
    status: STAGE_TO_STATUS[String(contact.stage)] ?? "novo",
    ambiente: (qualification.ambiente as Lead["ambiente"]) ?? null,
    valor_estimado: Number(contact.estimated_mrr ?? 0) || null,
    etapa_obra: (qualification.etapa_obra as Lead["etapa_obra"]) ?? null,
    prazo: (qualification.prazo as Lead["prazo"]) ?? null,
    dor_principal: qualification.dor_principal ? String(qualification.dor_principal) : null,
    gargalo: qualification.gargalo ? String(qualification.gargalo) : null,
    ja_investe_ads: Boolean(qualification.ja_investe_ads),
    tamanho_loja: (qualification.tamanho_loja as Lead["tamanho_loja"]) ?? null,
    observacoes: contact.notes ? String(contact.notes) : null,
    tags: Array.isArray(contact.tags) ? contact.tags.map(String) : [],
    pain_score: Number(contact.lead_score ?? 5),
    proximo_followup: contact.next_action_at ? String(contact.next_action_at) : null,
    followup_ativo: Boolean(contact.next_action_at) && !["Fechado", "Perdido"].includes(String(contact.stage)),
    status_detalhado: {
      data: contact.won_at ? String(contact.won_at) : contact.lost_at ? String(contact.lost_at) : undefined,
      valor_final: contact.estimated_mrr ? Number(contact.estimated_mrr) : undefined,
      motivo: contact.loss_reason ? String(contact.loss_reason) : undefined,
    },
    instagram_handle: contact.instagram ? String(contact.instagram) : null,
    deleted_at: contact.deleted_at ? String(contact.deleted_at) : null,
    created_at: String(contact.created_at),
    updated_at: String(contact.updated_at),
    contact_name: contact.contact_name ? String(contact.contact_name) : null,
    email: contact.email ? String(contact.email) : null,
    state: contact.state ? String(contact.state) : null,
    niche: contact.niche ? String(contact.niche) : null,
    pipeline: String(contact.pipeline ?? "prospeccao") as Lead["pipeline"],
    source: String(contact.source ?? "Prospecção ativa"),
    prospect_status: String(contact.prospect_status ?? "Não contatado"),
    temperature: String(contact.temperature ?? "Morno") as Lead["temperature"],
    next_action_text: contact.next_action_text ? String(contact.next_action_text) : null,
    campaign: contact.campaign ? String(contact.campaign) : null,
    adset: contact.adset ? String(contact.adset) : null,
    ad_name: contact.ad_name ? String(contact.ad_name) : null,
    form_name: contact.form_name ? String(contact.form_name) : null,
    utm_source: contact.utm_source ? String(contact.utm_source) : null,
    utm_medium: contact.utm_medium ? String(contact.utm_medium) : null,
    utm_campaign: contact.utm_campaign ? String(contact.utm_campaign) : null,
    utm_content: contact.utm_content ? String(contact.utm_content) : null,
    loss_reason: contact.loss_reason ? String(contact.loss_reason) : null,
    list_id: contact.list_id ? String(contact.list_id) : null,
    first_contact_at: contact.first_contact_at ? String(contact.first_contact_at) : null,
    responded_at: contact.responded_at ? String(contact.responded_at) : null,
    qualified_at: contact.qualified_at ? String(contact.qualified_at) : null,
    meeting_at: contact.meeting_at ? String(contact.meeting_at) : null,
    proposal_at: contact.proposal_at ? String(contact.proposal_at) : null,
    last_contact_at: contact.last_contact_at ? String(contact.last_contact_at) : null,
    last_message_step: Number(contact.last_message_step ?? 0),
  };
}

function activityType(value: unknown): TipoInteracao {
  const type = String(value ?? "note");
  if (type === "follow_up" || type === "followup") return "followup";
  if (type === "stage_change") return "mudanca_status";
  if (type === "call") return "call";
  if (type === "meeting" || type === "reuniao") return "reuniao";
  if (type === "proposal" || type === "proposta") return "proposta";
  if (type === "instagram") return "dm_enviado";
  if (type === "note" || type === "created" || type === "task") return "nota";
  return "outro";
}

export function activityToInteraction(activity: UnknownRecord): Interacao {
  return {
    id: String(activity.id),
    lead_id: activity.contact_id ? String(activity.contact_id) : "",
    tipo: activityType(activity.activity_type),
    descricao: String(activity.content ?? activity.title ?? "Atividade registrada"),
    canal: null,
    created_at: String(activity.occurred_at ?? activity.created_at),
    deleted_at: null,
  };
}

export function contactToLeadWithInteractions(
  contact: UnknownRecord,
  activities: UnknownRecord[]
): LeadWithInteracoes {
  return {
    ...contactToLead(contact),
    interacoes: activities
      .filter((item) => String(item.contact_id) === String(contact.id))
      .map(activityToInteraction),
  };
}

export function leadPayloadToContact(payload: UnknownRecord): UnknownRecord {
  const origem = (payload.origem as OrigemLead | undefined) ?? "prospeccao_instagram";
  const pipeline = payload.pipeline ?? (origem === "anuncio" ? "anuncios" : "prospeccao");
  const qualification = {
    ambiente: payload.ambiente ?? null,
    etapa_obra: payload.etapa_obra ?? null,
    prazo: payload.prazo ?? null,
    dor_principal: payload.dor_principal ?? null,
    gargalo: payload.gargalo ?? null,
    ja_investe_ads: payload.ja_investe_ads ?? false,
    tamanho_loja: payload.tamanho_loja ?? null,
  };

  const result: UnknownRecord = {
    company: payload.nome,
    contact_name: payload.contact_name,
    phone: payload.telefone,
    email: payload.email,
    instagram: payload.instagram_handle,
    city: payload.cidade,
    state: payload.state,
    niche: payload.niche,
    source: payload.origem !== undefined ? ORIGIN_TO_SOURCE[origem] : payload.source,
    pipeline,
    prospect_status: payload.prospect_status,
    temperature: payload.temperature,
    estimated_mrr: payload.valor_estimado,
    notes: payload.observacoes,
    next_action_text: payload.next_action_text,
    next_action_at: payload.proximo_followup,
    campaign: payload.campaign,
    adset: payload.adset,
    ad_name: payload.ad_name,
    form_name: payload.form_name,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    lead_score: payload.pain_score,
    tags: payload.tags ?? [],
    qualification,
    loss_reason: payload.status_detalhado && typeof payload.status_detalhado === "object"
      ? (payload.status_detalhado as UnknownRecord).motivo
      : payload.loss_reason,
  };
  if (payload.status) result.stage = STATUS_TO_STAGE[payload.status as StatusLead];
  if (payload.list_id !== undefined) result.list_id = payload.list_id;
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value !== undefined));
}
