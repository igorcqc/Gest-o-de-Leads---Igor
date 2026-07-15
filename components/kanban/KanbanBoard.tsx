"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { LeadCard } from "@/components/kanban/LeadCard";
import { updateLead } from "@/lib/api";
import { STATUS_ORDER, type Lead, type StatusLead } from "@/lib/types";

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const moveLead = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusLead }) =>
      updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    const overIsColumn = STATUS_ORDER.includes(over.id as StatusLead);
    const targetStatus = overIsColumn
      ? (over.id as StatusLead)
      : leads.find((l) => l.id === over.id)?.status;

    if (!targetStatus || targetStatus === lead.status) return;

    moveLead.mutate({ id: lead.id, status: targetStatus });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leads.filter((lead) => lead.status === status)}
          />
        ))}
      </div>
      <DragOverlay>{activeLead && <LeadCard lead={activeLead} dragHandle={false} />}</DragOverlay>
    </DndContext>
  );
}
