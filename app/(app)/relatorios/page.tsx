"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/leads/StatusBadge";
import type { Lead } from "@/lib/types";

function percent(value: number, total: number) { return total ? Math.round((value / total) * 1000) / 10 : 0; }
function money(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

export default function RelatoriosPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/leads").then((response) => response.json()).then((data) => setLeads(data.leads ?? [])).finally(() => setLoading(false)); }, []);
  const stats = useMemo(() => {
    const contacted = leads.filter((lead) => lead.first_contact_at || lead.status !== "novo");
    const responded = leads.filter((lead) => lead.responded_at || ["respondeu", "qualificado", "reuniao", "proposta", "negociacao", "fechado"].includes(lead.status));
    const qualified = leads.filter((lead) => lead.qualified_at || ["qualificado", "reuniao", "proposta", "negociacao", "fechado"].includes(lead.status));
    const meetings = leads.filter((lead) => lead.meeting_at || ["reuniao", "proposta", "negociacao", "fechado"].includes(lead.status));
    const proposals = leads.filter((lead) => lead.proposal_at || ["proposta", "negociacao", "fechado"].includes(lead.status));
    const won = leads.filter((lead) => lead.status === "fechado");
    const speed = leads.filter((lead) => lead.first_contact_at).map((lead) => (new Date(lead.first_contact_at!).getTime() - new Date(lead.created_at).getTime()) / 60000).filter((minutes) => minutes >= 0);
    return { contacted, responded, qualified, meetings, proposals, won, avgSpeed: speed.length ? Math.round(speed.reduce((sum, item) => sum + item, 0) / speed.length) : 0 };
  }, [leads]);
  const sources = useMemo(() => Object.entries(leads.reduce<Record<string, number>>((acc, lead) => { acc[lead.source] = (acc[lead.source] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]), [leads]);
  const campaigns = useMemo(() => Object.entries(leads.reduce<Record<string, number>>((acc, lead) => { if (lead.campaign) acc[lead.campaign] = (acc[lead.campaign] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]), [leads]);
  const losses = useMemo(() => Object.entries(leads.reduce<Record<string, number>>((acc, lead) => { if (lead.status === "perdido") acc[lead.loss_reason || "Não informado"] = (acc[lead.loss_reason || "Não informado"] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]), [leads]);
  if (loading) return <Loader2 className="size-5 animate-spin" />;
  const funnel = [
    ["Contatados", stats.contacted.length], ["Responderam", stats.responded.length], ["Qualificados", stats.qualified.length],
    ["Reuniões", stats.meetings.length], ["Propostas", stats.proposals.length], ["Fechados", stats.won.length],
  ] as const;
  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Relatórios</h1><p className="text-sm text-muted-foreground">Conversão, velocidade e qualidade da operação.</p></div><Button asChild variant="outline"><a href="/api/export"><Download className="size-4" />Exportar CSV</a></Button></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card><CardContent><p className="text-xs text-muted-foreground">Total de contatos</p><p className="mt-1 text-2xl font-semibold">{leads.length}</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-muted-foreground">Taxa de resposta</p><p className="mt-1 text-2xl font-semibold">{percent(stats.responded.length, stats.contacted.length)}%</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-muted-foreground">Taxa de fechamento</p><p className="mt-1 text-2xl font-semibold">{percent(stats.won.length, leads.length)}%</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-muted-foreground">Tempo médio 1º contato</p><p className="mt-1 text-2xl font-semibold">{stats.avgSpeed} min</p></CardContent></Card>
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Funil geral</CardTitle></CardHeader><CardContent className="space-y-3">{funnel.map(([label, total]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-medium">{total} · {percent(total, leads.length)}%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${percent(total, leads.length)}%` }} /></div></div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Potencial por etapa</CardTitle></CardHeader><CardContent className="space-y-2">{Array.from(new Set(leads.map((lead) => lead.status))).map((status) => { const stageLeads = leads.filter((lead) => lead.status === status); return <div key={status} className="flex items-center justify-between"><StatusBadge status={status} /><span className="text-sm font-medium">{stageLeads.length} · {money(stageLeads.reduce((sum, lead) => sum + (lead.valor_estimado ?? 0), 0))}</span></div>; })}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Origens</CardTitle></CardHeader><CardContent className="space-y-2">{sources.length ? sources.map(([name, total]) => <div key={name} className="flex justify-between text-sm"><span>{name}</span><strong>{total}</strong></div>) : <p className="text-sm text-muted-foreground">Sem dados</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Campanhas</CardTitle></CardHeader><CardContent className="space-y-2">{campaigns.length ? campaigns.map(([name, total]) => <div key={name} className="flex justify-between text-sm"><span className="truncate">{name}</span><strong>{total}</strong></div>) : <p className="text-sm text-muted-foreground">Sem campanhas identificadas</p>}</CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">Motivos de perda</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">{losses.length ? losses.map(([name, total]) => <div key={name} className="flex justify-between rounded-md border border-border px-3 py-2 text-sm"><span>{name}</span><strong>{total}</strong></div>) : <p className="text-sm text-muted-foreground">Nenhuma perda registrada</p>}</CardContent></Card>
    </div>
  </div>;
}
