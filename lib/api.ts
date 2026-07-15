import type { Lead, LeadWithInteracoes, Interacao } from "@/lib/types";
import type { LeadFiltros } from "@/lib/filters";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Erro na requisição");
  }
  return response.json();
}

export function buildLeadsQuery(filtros: Partial<LeadFiltros> & { search?: string }) {
  const params = new URLSearchParams();
  if (filtros.origem?.length) params.set("origem", filtros.origem.join(","));
  if (filtros.status?.length) params.set("status", filtros.status.join(","));
  if (filtros.cidade) params.set("cidade", filtros.cidade);
  if (filtros.followup) params.set("followup", filtros.followup);
  if (filtros.scoreMin) params.set("scoreMin", String(filtros.scoreMin));
  if (filtros.search) params.set("search", filtros.search);
  return params.toString();
}

export async function fetchLeads(
  filtros: Partial<LeadFiltros> & { search?: string } = {}
): Promise<Lead[]> {
  const qs = buildLeadsQuery(filtros);
  const response = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
  const data = await handleResponse<{ leads: Lead[] }>(response);
  return data.leads;
}

export async function fetchLead(id: string): Promise<LeadWithInteracoes> {
  const response = await fetch(`/api/leads/${id}`);
  const data = await handleResponse<{ lead: LeadWithInteracoes }>(response);
  return data.lead;
}

export async function createLead(payload: Record<string, unknown>): Promise<Lead> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ lead: Lead }>(response);
  return data.lead;
}

export async function updateLead(id: string, payload: Record<string, unknown>): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ lead: Lead }>(response);
  return data.lead;
}

export async function softDeleteLead(id: string): Promise<void> {
  const response = await fetch(`/api/leads/${id}`, { method: "DELETE" });
  await handleResponse(response);
}

export async function permanentDeleteLead(id: string): Promise<void> {
  const response = await fetch(`/api/leads/${id}?permanent=true`, { method: "DELETE" });
  await handleResponse(response);
}

export async function restoreLead(id: string): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}/restore`, { method: "POST" });
  const data = await handleResponse<{ lead: Lead }>(response);
  return data.lead;
}

export async function fetchLixeira(): Promise<Lead[]> {
  const response = await fetch("/api/leads/lixeira");
  const data = await handleResponse<{ leads: Lead[] }>(response);
  return data.leads;
}

export async function addInteracao(
  leadId: string,
  payload: { tipo: string; descricao: string; canal?: string | null }
): Promise<Interacao> {
  const response = await fetch(`/api/leads/${leadId}/interacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ interacao: Interacao }>(response);
  return data.interacao;
}

export async function followupAction(
  leadId: string,
  acao: "concluir" | "reagendar" | "pausar" | "reativar",
  data?: string
): Promise<Lead> {
  const response = await fetch(`/api/leads/${leadId}/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao, data }),
  });
  const parsed = await handleResponse<{ lead: Lead }>(response);
  return parsed.lead;
}
