import { cn } from "@/lib/utils";
import { STATUS_LABELS, type StatusLead } from "@/lib/types";

export function StatusBadge({ status, className }: { status: StatusLead; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className
      )}
      style={{
        backgroundColor: `var(--status-${status}-bg)`,
        color: `var(--status-${status}-fg)`,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
