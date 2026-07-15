"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddInteracao } from "@/hooks/use-leads";
import { TIPO_INTERACAO_LABELS, CANAL_LABELS } from "@/lib/types";

export function AddInteracaoDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("nota");
  const [canal, setCanal] = useState<string | undefined>(undefined);
  const [descricao, setDescricao] = useState("");
  const { mutate, isPending } = useAddInteracao(leadId);

  function handleSubmit() {
    if (!descricao.trim()) return;
    mutate(
      { tipo, descricao: descricao.trim(), canal: canal ?? null },
      {
        onSuccess: () => {
          setOpen(false);
          setDescricao("");
          setTipo("nota");
          setCanal(undefined);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-3.5" /> Adicionar interação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar interação</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_INTERACAO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Canal</Label>
            <Select value={canal} onValueChange={setCanal}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CANAL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              rows={3}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !descricao.trim()}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
