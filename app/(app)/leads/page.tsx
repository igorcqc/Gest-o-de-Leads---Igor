"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, TableIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/hooks/use-leads";
import { FILTROS_VAZIOS, type LeadFiltros, type FollowupFiltro } from "@/lib/filters";

export default function LeadsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LeadsPageContent />
    </Suspense>
  );
}

function LeadsPageContent() {
  const searchParams = useSearchParams();
  const followupInicial = searchParams.get("followup") as FollowupFiltro | null;

  const [view, setView] = useState<"kanban" | "tabela">("kanban");
  const [pipeline, setPipeline] = useState<"todos" | "prospeccao" | "anuncios">("todos");
  const [filtros, setFiltros] = useState<LeadFiltros>({
    ...FILTROS_VAZIOS,
    followup: followupInicial,
  });

  const { data: leads, isLoading, isError } = useLeads(filtros);

  const leadsFiltrados = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      if (pipeline !== "todos" && lead.pipeline !== pipeline) return false;
      return !filtros.scoreMin || (lead.pain_score ?? 0) >= filtros.scoreMin;
    });
  }, [leads, filtros.scoreMin, pipeline]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pipeline comercial</h1>
          <p className="text-sm text-muted-foreground">
            {leadsFiltrados.length} {leadsFiltrados.length === 1 ? "lead" : "leads"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "tabela")}>
            <TabsList>
              <TabsTrigger value="kanban">
                <LayoutGrid className="size-4" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="tabela">
                <TableIcon className="size-4" /> Tabela
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild size="sm">
            <Link href="/leads/novo">
              <Plus className="size-4" /> Novo Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={pipeline === "todos" ? "default" : "outline"} onClick={() => setPipeline("todos")}>Todos</Button>
        <Button size="sm" variant={pipeline === "prospeccao" ? "default" : "outline"} onClick={() => setPipeline("prospeccao")}>Prospecção ativa</Button>
        <Button size="sm" variant={pipeline === "anuncios" ? "default" : "outline"} onClick={() => setPipeline("anuncios")}>Leads de anúncios</Button>
      </div>

      <LeadFilters filtros={filtros} onChange={setFiltros} />

      {isLoading && (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">Não foi possível carregar os leads.</p>
      )}

      {!isLoading && !isError && leadsFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum lead encontrado. Que tal cadastrar o primeiro?
          </p>
          <Button asChild size="sm">
            <Link href="/leads/novo">
              <Plus className="size-4" /> Novo Lead
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && leadsFiltrados.length > 0 && view === "kanban" && (
        <KanbanBoard leads={leadsFiltrados} />
      )}

      {!isLoading && !isError && leadsFiltrados.length > 0 && view === "tabela" && (
        <LeadTable leads={leadsFiltrados} />
      )}
    </div>
  );
}
