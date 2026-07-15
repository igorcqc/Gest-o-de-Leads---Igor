"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFollowupAction } from "@/hooks/use-leads";

function formatDate(value: string | null) {
  if (!value) return "Sem follow-up agendado";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FollowupCard({
  leadId,
  proximoFollowup,
  followupAtivo,
}: {
  leadId: string;
  proximoFollowup: string | null;
  followupAtivo: boolean;
}) {
  const [reagendando, setReagendando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const { mutate, isPending } = useFollowupAction(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Próximo follow-up
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock className="size-4 text-muted-foreground" />
          {formatDate(proximoFollowup)}
          {!followupAtivo && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              Pausado
            </span>
          )}
        </div>

        {reagendando ? (
          <div className="flex flex-col gap-2">
            <Input
              type="datetime-local"
              value={novaData}
              onChange={(event) => setNovaData(event.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!novaData || isPending}
                onClick={() => {
                  mutate({ acao: "reagendar", data: novaData });
                  setReagendando(false);
                }}
              >
                Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReagendando(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => mutate({ acao: "concluir" })}
            >
              <CheckCircle2 className="size-3.5" /> Marcar como feito
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReagendando(true)}>
              Reagendar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => mutate({ acao: followupAtivo ? "pausar" : "reativar" })}
            >
              {followupAtivo ? (
                <>
                  <PauseCircle className="size-3.5" /> Pausar
                </>
              ) : (
                <>
                  <PlayCircle className="size-3.5" /> Reativar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
