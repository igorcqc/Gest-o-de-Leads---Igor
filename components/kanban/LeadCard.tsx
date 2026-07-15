"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, Megaphone, Search, Users2, Sparkles, GripVertical } from "lucide-react";
import { PainScoreBadge } from "@/components/leads/PainScoreBadge";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

const ORIGEM_ICON: Record<string, typeof Megaphone> = {
  anuncio: Megaphone,
  prospeccao_instagram: Search,
  indicacao: Users2,
  organico: Sparkles,
};

function isFollowupHoje(date: string | null) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isFollowupAtrasado(date: string | null) {
  if (!date) return false;
  return new Date(date) < new Date(new Date().toDateString());
}

export function LeadCard({ lead, dragHandle = true }: { lead: Lead; dragHandle?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const OrigemIcon = ORIGEM_ICON[lead.origem] ?? Sparkles;
  const atrasado = isFollowupAtrasado(lead.proximo_followup);
  const hoje = isFollowupHoje(lead.proximo_followup);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-card p-3 shadow-sm",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          className="min-w-0 flex-1 text-sm font-medium hover:underline"
        >
          {lead.nome}
        </Link>
        {dragHandle && (
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {lead.cidade && (
          <span className="flex items-center gap-0.5">
            <MapPin className="size-3" /> {lead.cidade}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <OrigemIcon className="size-3" />
        </span>
      </div>

      {lead.dor_principal && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {lead.dor_principal}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <PainScoreBadge score={lead.pain_score} />
        {lead.proximo_followup && (atrasado || hoje) && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              atrasado ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-warning-foreground"
            )}
          >
            {atrasado ? "Atrasado" : "Hoje"}
          </span>
        )}
      </div>
    </div>
  );
}
