import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/lib/api";
import type { LeadFiltros } from "@/lib/filters";

export function useLeads(filtros: Partial<LeadFiltros> & { search?: string } = {}) {
  return useQuery({
    queryKey: ["leads", filtros],
    queryFn: () => api.fetchLeads(filtros),
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => api.fetchLead(id as string),
    enabled: Boolean(id),
  });
}

export function useLixeira() {
  return useQuery({
    queryKey: ["lixeira"],
    queryFn: api.fetchLixeira,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead cadastrado com sucesso");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.updateLead(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Lead atualizado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSoftDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.softDeleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lixeira"] });
      toast.success("Lead movido para a lixeira");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRestoreLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.restoreLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lixeira"] });
      toast.success("Lead restaurado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePermanentDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.permanentDeleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lixeira"] });
      toast.success("Lead apagado definitivamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddInteracao(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { tipo: string; descricao: string; canal?: string | null }) =>
      api.addInteracao(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success("Interação adicionada");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useFollowupAction(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      acao,
      data,
    }: {
      acao: "concluir" | "reagendar" | "pausar" | "reativar";
      data?: string;
    }) => api.followupAction(leadId, acao, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success("Follow-up atualizado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
