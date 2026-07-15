"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchLeads } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/types";

export function SearchBar() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results } = useQuery({
    queryKey: ["search", term],
    queryFn: () => fetchLeads({ search: term }),
    enabled: term.trim().length > 1,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar por nome, telefone, cidade, tag..."
        className="pl-8"
      />
      {open && term.trim().length > 1 && (
        <div className="absolute z-40 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {results && results.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((lead) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      router.push(`/leads/${lead.id}`);
                      setOpen(false);
                      setTerm("");
                    }}
                  >
                    <span className="font-medium">{lead.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {[lead.cidade, STATUS_LABELS[lead.status]].filter(Boolean).join(" · ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum lead encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}
