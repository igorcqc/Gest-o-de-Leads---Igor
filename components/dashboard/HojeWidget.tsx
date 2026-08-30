"use client";

import Link from "next/link";
import { AlertTriangle, Clock, RotateCcw, Phone, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/leads/StatusBadge";
import type { HojeLead, HojeCall } from "@/hooks/use-dashboard";

function LeadRow({ lead, dateLabel }: { lead: HojeLead; dateLabel?: string }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{lead.nome}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[lead.cidade, lead.telefone].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {dateLabel && <span className="text-xs text-muted-foreground">{dateLabel}</span>}
        </div>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href={`/leads/${lead.id}`}>
          Ir <ArrowRight className="size-3" />
        </Link>
      </Button>
    </li>
  );
}

function EmptySection({ message }: { message: string }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{message}</p>;
}

interface HojeWidgetProps {
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
}

export function HojeWidget({
  atrasados, hoje, reativar, calls, novosHoje, followupsFeitos,
  metaNovos, metaFollowups, aguardandoPrimeiroContato, slaEstourado, slaMinutos,
}: HojeWidgetProps) {
  const total = atrasados.length + hoje.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Você tem {total} {total === 1 ? "ação" : "ações"} para hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Novos contatos</p>
            <p className="mt-1 text-xl font-semibold">{novosHoje}<span className="text-sm text-muted-foreground">/{metaNovos}</span></p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Follow-ups feitos</p>
            <p className="mt-1 text-xl font-semibold">{followupsFeitos}<span className="text-sm text-muted-foreground">/{metaFollowups}</span></p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Aguardando 1º contato</p>
            <p className="mt-1 text-xl font-semibold">{aguardandoPrimeiroContato}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">SLA acima de {slaMinutos} min</p>
            <p className={`mt-1 text-xl font-semibold ${slaEstourado ? "text-destructive" : "text-success"}`}>{slaEstourado}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-destructive">
              <AlertTriangle className="size-4" /> Atrasado ({atrasados.length})
            </h3>
            {atrasados.length === 0 ? (
              <EmptySection message="Nenhum follow-up atrasado" />
            ) : (
              <ul className="flex flex-col gap-2">
                {atrasados.slice(0, 5).map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-warning-foreground">
              <Clock className="size-4" /> Hoje ({hoje.length})
            </h3>
            {hoje.length === 0 ? (
              <EmptySection message="Nada agendado para hoje" />
            ) : (
              <ul className="flex flex-col gap-2">
                {hoje.slice(0, 5).map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <RotateCcw className="size-4" /> Reativar ({reativar.length})
            </h3>
            {reativar.length === 0 ? (
              <EmptySection message="Nenhum lead parado" />
            ) : (
              <ul className="flex flex-col gap-2">
                {reativar.slice(0, 5).map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success">
              <Phone className="size-4" /> Calls ({calls.length})
            </h3>
            {calls.length === 0 ? (
              <EmptySection message="Nenhuma call hoje" />
            ) : (
              <ul className="flex flex-col gap-2">
                {calls.slice(0, 5).map((call) => (
                  <li
                    key={call.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {call.leads?.nome ?? "Lead"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {call.descricao}
                      </p>
                    </div>
                    {call.leads && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/leads/${call.leads.id}`}>
                          Ir <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3 text-right">
          <Button asChild variant="link" size="sm">
            <Link href="/leads?followup=atrasado">Ver todos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
