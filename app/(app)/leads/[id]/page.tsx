"use client";

import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChangeDropdown } from "@/components/leads/StatusChangeDropdown";
import { PainScoreBadge } from "@/components/leads/PainScoreBadge";
import { LeadForm, type LeadFormValues } from "@/components/leads/LeadForm";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { FollowupCard } from "@/components/leads/FollowupCard";
import { AcoesRapidas } from "@/components/leads/AcoesRapidas";
import { AddInteracaoDialog } from "@/components/leads/AddInteracaoDialog";
import { DeleteLeadButton } from "@/components/leads/DeleteLeadButton";
import { useLead, useUpdateLead } from "@/hooks/use-leads";
import { ORIGEM_LABELS } from "@/lib/types";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lead, isLoading, isError } = useLead(id);
  const { mutate: updateLead, isPending } = useUpdateLead(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !lead) {
    return <p className="text-sm text-muted-foreground">Lead não encontrado.</p>;
  }

  function handleSave(values: LeadFormValues) {
    updateLead(values);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{lead.nome}</h1>
              <Badge variant="outline">{ORIGEM_LABELS[lead.origem]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {[lead.cidade, lead.telefone].filter(Boolean).join(" · ") || "Sem cidade/telefone"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PainScoreBadge score={lead.pain_score} />
            <StatusChangeDropdown leadId={lead.id} status={lead.status} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <LeadForm mode="edit" initialData={lead} onSubmit={handleSave} submitting={isPending} />
          <DeleteLeadButton leadId={lead.id} leadNome={lead.nome} />
        </div>

        <div className="flex flex-col gap-4">
          <FollowupCard
            leadId={lead.id}
            proximoFollowup={lead.proximo_followup}
            followupAtivo={lead.followup_ativo}
          />
          <AcoesRapidas telefone={lead.telefone} instagramHandle={lead.instagram_handle} nome={lead.contact_name ?? lead.nome} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Histórico
              </CardTitle>
              <AddInteracaoDialog leadId={lead.id} />
            </CardHeader>
            <CardContent>
              <LeadTimeline interacoes={lead.interacoes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
