"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { PainScoreBadge } from "@/components/leads/PainScoreBadge";
import { ORIGEM_LABELS, type Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortField = "nome" | "cidade" | "origem" | "status" | "pain_score" | "proximo_followup" | "valor_estimado" | "updated_at";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "nome", label: "Nome" },
  { field: "cidade", label: "Cidade" },
  { field: "origem", label: "Origem" },
  { field: "status", label: "Status" },
  { field: "pain_score", label: "Score" },
  { field: "proximo_followup", label: "Follow-up" },
  { field: "valor_estimado", label: "Valor" },
  { field: "updated_at", label: "Atualizado" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = [...leads].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className="cursor-pointer select-none px-3 py-2 text-left font-medium text-muted-foreground"
                onClick={() => toggleSort(col.field)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortField === col.field ? (
                    sortDir === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3 opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead, index) => (
            <tr
              key={lead.id}
              className={cn(
                "border-t border-border hover:bg-accent",
                index % 2 === 1 && "bg-muted/20"
              )}
            >
              <td className="px-3 py-2">
                <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                  {lead.nome}
                </Link>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{lead.cidade ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{ORIGEM_LABELS[lead.origem]}</td>
              <td className="px-3 py-2">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-3 py-2">
                <PainScoreBadge score={lead.pain_score} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {formatDate(lead.proximo_followup)}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {formatCurrency(lead.valor_estimado)}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{formatDate(lead.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum lead encontrado com os filtros atuais.
        </p>
      )}
    </div>
  );
}
