"use client";

import { Slider } from "@/components/ui/slider";
import { PainScoreBadge } from "@/components/leads/PainScoreBadge";
import {
  ETAPA_OBRA_LABELS,
  TAMANHO_LOJA_LABELS,
  type EtapaObra,
  type TamanhoLoja,
} from "@/lib/types";

interface PainScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  jaInvesteAds?: boolean | null;
  tamanhoLoja?: TamanhoLoja | null;
  valorEstimado?: number | null;
  etapaObra?: EtapaObra | null;
}

export function PainScoreSlider({
  value,
  onChange,
  jaInvesteAds,
  tamanhoLoja,
  valorEstimado,
  etapaObra,
}: PainScoreSliderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          min={0}
          max={10}
          step={1}
          onValueChange={([v]) => onChange(v)}
          className="flex-1"
        />
        <PainScoreBadge score={value} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
        <span>Já investe em ads: {jaInvesteAds ? "Sim" : "Não"}</span>
        <span>Tamanho: {tamanhoLoja ? TAMANHO_LOJA_LABELS[tamanhoLoja] : "—"}</span>
        <span>
          Valor: {valorEstimado ? valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
        </span>
        <span>Etapa da obra: {etapaObra ? ETAPA_OBRA_LABELS[etapaObra] : "—"}</span>
      </div>
    </div>
  );
}
