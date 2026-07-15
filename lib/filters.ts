import type { OrigemLead, StatusLead } from "@/lib/types";

export type FollowupFiltro = "atrasado" | "hoje" | "proximos_7_dias" | "sem";

export interface LeadFiltros {
  origem: OrigemLead[];
  status: StatusLead[];
  cidade: string;
  followup: FollowupFiltro | null;
  scoreMin: number;
}

export interface FiltroSalvo {
  id: string;
  nome: string;
  filtros: LeadFiltros;
}

const STORAGE_KEY = "crm-planejados:filtros-salvos";

export const FILTROS_VAZIOS: LeadFiltros = {
  origem: [],
  status: [],
  cidade: "",
  followup: null,
  scoreMin: 0,
};

export function carregarFiltrosSalvos(): FiltroSalvo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FiltroSalvo[];
  } catch {
    return [];
  }
}

export function salvarFiltro(nome: string, filtros: LeadFiltros): FiltroSalvo[] {
  const atuais = carregarFiltrosSalvos();
  const novo: FiltroSalvo = {
    id: crypto.randomUUID(),
    nome,
    filtros,
  };
  const atualizados = [...atuais, novo];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
  return atualizados;
}

export function excluirFiltroSalvo(id: string): FiltroSalvo[] {
  const atuais = carregarFiltrosSalvos();
  const atualizados = atuais.filter((filtro) => filtro.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
  return atualizados;
}
