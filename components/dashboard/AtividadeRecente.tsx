import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPO_INTERACAO_LABELS, type TipoInteracao } from "@/lib/types";
import type { AtividadeItem } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AtividadeRecente({ items }: { items: AtividadeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Atividade recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma atividade ainda
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {item.leads && (
                    <Link href={`/leads/${item.leads.id}`} className="font-medium hover:underline">
                      {item.leads.nome}
                    </Link>
                  )}{" "}
                  <span className="text-muted-foreground">
                    {TIPO_INTERACAO_LABELS[item.tipo as TipoInteracao] ?? item.tipo}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
