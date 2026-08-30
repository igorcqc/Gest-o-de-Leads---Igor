"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { HojeWidget } from "@/components/dashboard/HojeWidget";
import { KPICards } from "@/components/dashboard/KPICards";
import { AtividadeRecente } from "@/components/dashboard/AtividadeRecente";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar o dashboard. Tente novamente.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">O que precisa ser feito hoje</p>
      </div>

      <HojeWidget
        atrasados={data.hoje.atrasados}
        hoje={data.hoje.hoje}
        reativar={data.hoje.reativar}
        calls={data.hoje.calls}
        novosHoje={data.hoje.novosHoje}
        followupsFeitos={data.hoje.followupsFeitos}
        metaNovos={data.hoje.metaNovos}
        metaFollowups={data.hoje.metaFollowups}
        aguardandoPrimeiroContato={data.hoje.aguardandoPrimeiroContato}
        slaEstourado={data.hoje.slaEstourado}
        slaMinutos={data.hoje.slaMinutos}
      />

      <KPICards
        leadsAtivos={data.kpis.leadsAtivos}
        clientesAtivos={data.kpis.clientesAtivos}
        taxaConversao={data.kpis.taxaConversao}
        pipelineMrr={data.kpis.pipelineMrr}
        funilDoMes={data.kpis.funilDoMes}
      />

      <AtividadeRecente items={data.atividadeRecente} />
    </div>
  );
}
