"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/leads/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLixeira, useRestoreLead, usePermanentDeleteLead } from "@/hooks/use-leads";
import type { Lead } from "@/lib/types";

export default function LixeiraPage() {
  const { data: leads, isLoading, isError } = useLixeira();
  const { mutate: restore } = useRestoreLead();
  const { mutate: permanentDelete } = usePermanentDeleteLead();
  const [alvo, setAlvo] = useState<Lead | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">Não foi possível carregar a lixeira.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Lixeira</h1>
        <p className="text-sm text-muted-foreground">
          Leads apagados. Restaure ou apague definitivamente.
        </p>
      </div>

      {(!leads || leads.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">A lixeira está vazia.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {leads?.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{lead.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {[lead.cidade, lead.telefone].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="mt-1">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => restore(lead.id)}>
                  <RotateCcw className="size-3.5" /> Restaurar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setAlvo(lead)}
                >
                  <Trash2 className="size-3.5" /> Apagar definitivamente
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(alvo)} onOpenChange={(open) => !open && setAlvo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar definitivamente</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. &quot;{alvo?.nome}&quot; e todo o seu histórico
              de interações serão apagados para sempre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlvo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (alvo) permanentDelete(alvo.id);
                setAlvo(null);
              }}
            >
              Apagar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
