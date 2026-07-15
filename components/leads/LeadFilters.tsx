"use client";

import { useEffect, useState } from "react";
import { Save, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ORIGEM_LABELS, STATUS_LABELS, type OrigemLead, type StatusLead } from "@/lib/types";
import {
  carregarFiltrosSalvos,
  salvarFiltro,
  excluirFiltroSalvo,
  FILTROS_VAZIOS,
  type LeadFiltros,
  type FiltroSalvo,
  type FollowupFiltro,
} from "@/lib/filters";
import { toast } from "sonner";

const ORIGENS: OrigemLead[] = ["anuncio", "prospeccao_instagram", "indicacao", "organico"];
const STATUSES: StatusLead[] = [
  "novo",
  "em_contato",
  "respondeu",
  "qualificado",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
];
const FOLLOWUPS: { value: FollowupFiltro; label: string }[] = [
  { value: "atrasado", label: "Atrasado" },
  { value: "hoje", label: "Hoje" },
  { value: "proximos_7_dias", label: "Próximos 7 dias" },
  { value: "sem", label: "Sem follow-up" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

interface LeadFiltersProps {
  filtros: LeadFiltros;
  onChange: (filtros: LeadFiltros) => void;
}

export function LeadFilters({ filtros, onChange }: LeadFiltersProps) {
  const [filtrosSalvos, setFiltrosSalvos] = useState<FiltroSalvo[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [nomeFiltro, setNomeFiltro] = useState("");

  useEffect(() => {
    // Lido apenas no cliente para evitar mismatch de hidratação com o localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltrosSalvos(carregarFiltrosSalvos());
  }, []);

  function toggleOrigem(origem: OrigemLead) {
    const novo = filtros.origem.includes(origem)
      ? filtros.origem.filter((o) => o !== origem)
      : [...filtros.origem, origem];
    onChange({ ...filtros, origem: novo });
  }

  function toggleStatus(status: StatusLead) {
    const novo = filtros.status.includes(status)
      ? filtros.status.filter((s) => s !== status)
      : [...filtros.status, status];
    onChange({ ...filtros, status: novo });
  }

  function setFollowup(value: FollowupFiltro) {
    onChange({ ...filtros, followup: filtros.followup === value ? null : value });
  }

  function handleSalvarFiltro() {
    if (!nomeFiltro.trim()) return;
    const atualizados = salvarFiltro(nomeFiltro.trim(), filtros);
    setFiltrosSalvos(atualizados);
    setNomeFiltro("");
    setSaveDialogOpen(false);
    toast.success("Filtro salvo");
  }

  function handleExcluirFiltro(id: string) {
    const atualizados = excluirFiltroSalvo(id);
    setFiltrosSalvos(atualizados);
    toast.success("Filtro excluído");
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filtros salvos <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {filtrosSalvos.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum filtro salvo</p>
              )}
              {filtrosSalvos.map((salvo) => (
                <div key={salvo.id} className="flex items-center">
                  <DropdownMenuItem
                    className="flex-1"
                    onClick={() => onChange(salvo.filtros)}
                  >
                    {salvo.nome}
                  </DropdownMenuItem>
                  <button
                    type="button"
                    className="px-2 text-muted-foreground hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleExcluirFiltro(salvo.id);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onChange(FILTROS_VAZIOS)}>
                Limpar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
            <Save className="size-3.5" /> Salvar filtro atual
          </Button>
        </div>

        <Input
          value={filtros.cidade}
          onChange={(event) => onChange({ ...filtros, cidade: event.target.value })}
          placeholder="Filtrar por cidade..."
          className="w-full max-w-[200px]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Origem</span>
        <div className="flex flex-wrap gap-1.5">
          {ORIGENS.map((origem) => (
            <Chip key={origem} active={filtros.origem.includes(origem)} onClick={() => toggleOrigem(origem)}>
              {ORIGEM_LABELS[origem]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Status</span>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => (
            <Chip key={status} active={filtros.status.includes(status)} onClick={() => toggleStatus(status)}>
              {STATUS_LABELS[status]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Próximo follow-up</span>
        <div className="flex flex-wrap gap-1.5">
          {FOLLOWUPS.map((item) => (
            <Chip key={item.value} active={filtros.followup === item.value} onClick={() => setFollowup(item.value)}>
              {item.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Pain Score mínimo</span>
        <input
          type="range"
          min={0}
          max={10}
          value={filtros.scoreMin}
          onChange={(event) => onChange({ ...filtros, scoreMin: Number(event.target.value) })}
          className="w-40"
        />
        <span className="text-xs font-medium">{filtros.scoreMin}</span>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar filtro atual</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filtro-nome">Nome do filtro</Label>
            <Input
              id="filtro-nome"
              value={nomeFiltro}
              onChange={(event) => setNomeFiltro(event.target.value)}
              placeholder="Ex: Leads quentes SP"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarFiltro}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
