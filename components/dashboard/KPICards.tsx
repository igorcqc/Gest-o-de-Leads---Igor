import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS, type StatusLead } from "@/lib/types";

interface KPICardsProps {
  leadsAtivos: number;
  clientesAtivos: number;
  taxaConversao: number;
  pipelineMrr: number;
  funilDoMes: { status: StatusLead; total: number }[];
}

export function KPICards({
  leadsAtivos,
  clientesAtivos,
  taxaConversao,
  pipelineMrr,
  funilDoMes,
}: KPICardsProps) {
  const maxFunil = Math.max(1, ...funilDoMes.map((item) => item.total));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Leads ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{leadsAtivos}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de conversão (mês)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{taxaConversao}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Potencial no pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {pipelineMrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          </p>
        </CardContent>
      </Card>
      <p className="sr-only">{clientesAtivos} clientes fechados</p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Funil do mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            {funilDoMes.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
                  {STATUS_LABELS[item.status]}
                </span>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(item.total / maxFunil) * 100}%` }}
                  />
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-medium">
                  {item.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
