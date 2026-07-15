import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

export function PainScoreBadge({
  score,
  className,
}: {
  score: number | null | undefined;
  className?: string;
}) {
  if (score === null || score === undefined) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }

  const tier = score <= 3 ? "frio" : score <= 6 ? "morno" : "quente";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        tier === "frio" && "bg-muted text-muted-foreground",
        tier === "morno" && "bg-warning/20 text-warning-foreground",
        tier === "quente" &&
          "bg-destructive/15 text-destructive ring-1 ring-destructive/40",
        className
      )}
    >
      {tier === "quente" && <Flame className="size-3" />}
      {score}
    </span>
  );
}
