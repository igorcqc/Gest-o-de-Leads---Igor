import { useQuery } from "@tanstack/react-query";
import type { StatusLead } from "@/lib/types";

export interface HojeLead {
  id: string;
  nome: string;
  cidade: string | null;
  telefone: string | null;
  status: StatusLead;
  proximo_followup?: string | null;
  updated_at?: string;
}

export interface HojeCall {
  id: string;
  lead_id: string;
  tipo: string;
  descricao: string;
  created_at: string;
  leads: { id: string; nome: string; cidade: string | null; telefone: string | null } | null;
}

export interface AtividadeItem {
  id: string;
  tipo: string;
  descricao: string;
  created_at: string;
  leads: { id: string; nome: string } | null;
}

export interface DashboardData {
  hoje: {
    atrasados: HojeLead[];
    hoje: HojeLead[];
    reativar: HojeLead[];
    calls: HojeCall[];
    novosHoje: number;
    followupsFeitos: number;
    metaNovos: number;
    metaFollowups: number;
    aguardandoPrimeiroContato: number;
    slaEstourado: number;
    slaMinutos: number;
  };
  kpis: {
    leadsAtivos: number;
    clientesAtivos: number;
    taxaConversao: number;
    pipelineMrr: number;
    funilDoMes: { status: StatusLead; total: number }[];
  };
  atividadeRecente: AtividadeItem[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard");
  if (!response.ok) throw new Error("Erro ao carregar dashboard");
  return response.json();
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}
