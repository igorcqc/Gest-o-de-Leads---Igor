import {
  Send,
  Repeat,
  StickyNote,
  Shuffle,
  Phone,
  Handshake,
  FileText,
  Circle,
} from "lucide-react";
import { TIPO_INTERACAO_LABELS, CANAL_LABELS, type Interacao, type TipoInteracao } from "@/lib/types";

const ICONS: Record<TipoInteracao, typeof Send> = {
  dm_enviado: Send,
  followup: Repeat,
  nota: StickyNote,
  mudanca_status: Shuffle,
  call: Phone,
  reuniao: Handshake,
  proposta: FileText,
  outro: Circle,
};

const COLORS: Record<TipoInteracao, string> = {
  dm_enviado: "text-info",
  followup: "text-info",
  nota: "text-muted-foreground",
  mudanca_status: "text-primary",
  call: "text-success",
  reuniao: "text-success",
  proposta: "text-warning-foreground",
  outro: "text-muted-foreground",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadTimeline({ interacoes }: { interacoes: Interacao[] }) {
  if (interacoes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma interação registrada ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {interacoes.map((interacao) => {
        const Icon = ICONS[interacao.tipo] ?? Circle;
        return (
          <li key={interacao.id} className="flex gap-3">
            <div
              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted ${COLORS[interacao.tipo]}`}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium">
                  {TIPO_INTERACAO_LABELS[interacao.tipo]}
                </span>
                {interacao.canal && (
                  <span className="text-xs text-muted-foreground">
                    · {CANAL_LABELS[interacao.canal]}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{interacao.descricao}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(interacao.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
