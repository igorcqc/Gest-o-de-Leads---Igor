export type OrigemLead = "anuncio" | "prospeccao_instagram" | "indicacao" | "organico";

export type StatusLead =
  | "novo"
  | "em_contato"
  | "respondeu"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "fechado"
  | "perdido";

export type Ambiente =
  | "cozinha"
  | "quarto"
  | "escritorio"
  | "closet"
  | "sala"
  | "gourmet"
  | "banheiro"
  | "lavanderia"
  | "varios";

export type EtapaObra = "sonhando" | "planejando" | "em_obra" | "pronta";

export type Prazo = "imediato" | "30_dias" | "60_90_dias" | "sem_pressa";

export type TamanhoLoja = "1_loja" | "2_3_lojas" | "4_mais_lojas";

export type TipoInteracao =
  | "dm_enviado"
  | "followup"
  | "nota"
  | "mudanca_status"
  | "call"
  | "reuniao"
  | "proposta"
  | "outro";

export type CanalInteracao =
  | "instagram"
  | "whatsapp"
  | "telefone"
  | "email"
  | "presencial"
  | "outro";

export interface StatusDetalhado {
  data?: string;
  valor_final?: number;
  motivo?: string;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  origem: OrigemLead;
  status: StatusLead;
  ambiente: Ambiente | null;
  valor_estimado: number | null;
  etapa_obra: EtapaObra | null;
  prazo: Prazo | null;
  dor_principal: string | null;
  gargalo: string | null;
  ja_investe_ads: boolean;
  tamanho_loja: TamanhoLoja | null;
  observacoes: string | null;
  tags: string[];
  pain_score: number | null;
  proximo_followup: string | null;
  followup_ativo: boolean;
  status_detalhado: StatusDetalhado | null;
  instagram_handle: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interacao {
  id: string;
  lead_id: string;
  tipo: TipoInteracao;
  descricao: string;
  canal: CanalInteracao | null;
  created_at: string;
  deleted_at: string | null;
}

export interface LeadWithInteracoes extends Lead {
  interacoes: Interacao[];
}

export const ORIGEM_LABELS: Record<OrigemLead, string> = {
  anuncio: "Anúncio",
  prospeccao_instagram: "Prospecção Instagram",
  indicacao: "Indicação",
  organico: "Orgânico",
};

export const STATUS_LABELS: Record<StatusLead, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  respondeu: "Respondeu",
  qualificado: "Qualificado",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

export const STATUS_ORDER: StatusLead[] = [
  "novo",
  "em_contato",
  "respondeu",
  "qualificado",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
];

export const AMBIENTE_LABELS: Record<Ambiente, string> = {
  cozinha: "Cozinha",
  quarto: "Quarto",
  escritorio: "Escritório",
  closet: "Closet",
  sala: "Sala",
  gourmet: "Gourmet",
  banheiro: "Banheiro",
  lavanderia: "Lavanderia",
  varios: "Vários",
};

export const ETAPA_OBRA_LABELS: Record<EtapaObra, string> = {
  sonhando: "Sonhando",
  planejando: "Planejando",
  em_obra: "Em obra",
  pronta: "Pronta",
};

export const PRAZO_LABELS: Record<Prazo, string> = {
  imediato: "Imediato",
  "30_dias": "30 dias",
  "60_90_dias": "60-90 dias",
  sem_pressa: "Sem pressa",
};

export const TAMANHO_LOJA_LABELS: Record<TamanhoLoja, string> = {
  "1_loja": "1 loja",
  "2_3_lojas": "2-3 lojas",
  "4_mais_lojas": "4+ lojas",
};

export const TIPO_INTERACAO_LABELS: Record<TipoInteracao, string> = {
  dm_enviado: "DM enviado",
  followup: "Follow-up",
  nota: "Nota",
  mudanca_status: "Mudança de status",
  call: "Call",
  reuniao: "Reunião",
  proposta: "Proposta",
  outro: "Outro",
};

export const CANAL_LABELS: Record<CanalInteracao, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  telefone: "Telefone",
  email: "E-mail",
  presencial: "Presencial",
  outro: "Outro",
};
