"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { useUpdateLead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { STATUS_ORDER, STATUS_LABELS, type StatusLead } from "@/lib/types";

export function StatusChangeDropdown({
  leadId,
  status,
}: {
  leadId: string;
  status: StatusLead;
}) {
  const { mutate } = useUpdateLead(leadId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StatusBadge status={status} />
          Mudar status
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUS_ORDER.map((value) => (
          <DropdownMenuItem
            key={value}
            disabled={value === status}
            onClick={() => {
              if (value === "perdido") {
                const reason = window.prompt("Qual foi o motivo da perda?");
                if (!reason?.trim()) {
                  toast.error("O motivo da perda é obrigatório");
                  return;
                }
                mutate({ status: value, loss_reason: reason.trim() });
                return;
              }
              mutate({ status: value });
            }}
          >
            {STATUS_LABELS[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
