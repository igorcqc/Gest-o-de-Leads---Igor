"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LeadCard } from "@/components/kanban/LeadCard";
import { STATUS_LABELS, type Lead, type StatusLead } from "@/lib/types";

export function KanbanColumn({ status, leads }: { status: StatusLead; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40">
      <div
        className="flex items-center justify-between rounded-t-lg px-3 py-2"
        style={{
          backgroundColor: `var(--status-${status}-bg)`,
          color: `var(--status-${status}-fg)`,
        }}
      >
        <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs font-medium">
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 p-2 min-h-24 transition-colors ${
          isOver ? "bg-accent" : ""
        }`}
      >
        <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">Sem leads</p>
        )}
      </div>
    </div>
  );
}
