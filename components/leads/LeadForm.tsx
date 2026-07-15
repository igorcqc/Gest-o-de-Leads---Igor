"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/leads/TagsInput";
import { PainScoreSlider } from "@/components/leads/PainScoreSlider";
import { cn } from "@/lib/utils";
import {
  ORIGEM_LABELS,
  STATUS_LABELS,
  AMBIENTE_LABELS,
  ETAPA_OBRA_LABELS,
  PRAZO_LABELS,
  TAMANHO_LOJA_LABELS,
  type Lead,
} from "@/lib/types";

const formSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  telefone: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  origem: z.enum(["anuncio", "prospeccao_instagram", "indicacao", "organico"]),
  status: z.enum([
    "novo",
    "em_contato",
    "respondeu",
    "qualificado",
    "proposta",
    "negociacao",
    "fechado",
    "perdido",
  ]),
  instagram_handle: z.string().trim().optional(),
  ambiente: z.string().optional(),
  valor_estimado: z.union([z.coerce.number(), z.nan()]).optional(),
  etapa_obra: z.string().optional(),
  prazo: z.string().optional(),
  dor_principal: z.string().trim().optional(),
  gargalo: z.string().trim().optional(),
  ja_investe_ads: z.boolean(),
  tamanho_loja: z.string().optional(),
  observacoes: z.string().trim().optional(),
  tags: z.array(z.string()),
  pain_score: z.number().min(0).max(10),
});

export type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Lead>;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  submitting?: boolean;
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        {title}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="flex flex-col gap-4 border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

export function LeadForm({ mode, initialData, onSubmit, submitting }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      telefone: initialData?.telefone ?? "",
      cidade: initialData?.cidade ?? "",
      origem: initialData?.origem ?? "prospeccao_instagram",
      status: initialData?.status ?? "novo",
      instagram_handle: initialData?.instagram_handle ?? "",
      ambiente: initialData?.ambiente ?? undefined,
      valor_estimado: initialData?.valor_estimado ?? undefined,
      etapa_obra: initialData?.etapa_obra ?? undefined,
      prazo: initialData?.prazo ?? undefined,
      dor_principal: initialData?.dor_principal ?? "",
      gargalo: initialData?.gargalo ?? "",
      ja_investe_ads: initialData?.ja_investe_ads ?? false,
      tamanho_loja: initialData?.tamanho_loja ?? undefined,
      observacoes: initialData?.observacoes ?? "",
      tags: initialData?.tags ?? [],
      pain_score: initialData?.pain_score ?? 5,
    },
  });

  const tags = watch("tags");
  const painScore = watch("pain_score");
  const jaInvesteAds = watch("ja_investe_ads");
  const tamanhoLoja = watch("tamanho_loja");
  const valorEstimado = watch("valor_estimado");
  const etapaObra = watch("etapa_obra");

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="flex flex-col gap-4">
      <Section title="Informações básicas">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} placeholder="(11) 99999-9999" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...register("cidade")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagram_handle">Instagram</Label>
            <Input id="instagram_handle" {...register("instagram_handle")} placeholder="@usuario" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Origem *</Label>
            <Controller
              control={control}
              name="origem"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORIGEM_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status *</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </Section>

      <Section title="Qualificação">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Ambiente</Label>
            <Controller
              control={control}
              name="ambiente"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AMBIENTE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valor_estimado">Valor estimado (R$)</Label>
            <Input id="valor_estimado" type="number" step="0.01" {...register("valor_estimado")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Etapa da obra</Label>
            <Controller
              control={control}
              name="etapa_obra"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ETAPA_OBRA_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Prazo</Label>
            <Controller
              control={control}
              name="prazo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRAZO_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="dor_principal">Dor principal</Label>
            <Textarea id="dor_principal" {...register("dor_principal")} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="gargalo">Gargalo</Label>
            <Textarea id="gargalo" {...register("gargalo")} rows={2} />
          </div>
        </div>
      </Section>

      <Section title="Comercial">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
            <Label htmlFor="ja_investe_ads">Já investe em ads</Label>
            <Controller
              control={control}
              name="ja_investe_ads"
              render={({ field }) => (
                <Switch id="ja_investe_ads" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tamanho da loja</Label>
            <Controller
              control={control}
              name="tamanho_loja"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TAMANHO_LOJA_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Pain Score</Label>
          <PainScoreSlider
            value={painScore}
            onChange={(v) => setValue("pain_score", v)}
            jaInvesteAds={jaInvesteAds}
            tamanhoLoja={tamanhoLoja as never}
            valorEstimado={typeof valorEstimado === "number" ? valorEstimado : null}
            etapaObra={etapaObra as never}
          />
        </div>
      </Section>

      <Section title="Tags">
        <TagsInput value={tags} onChange={(v) => setValue("tags", v)} />
      </Section>

      <Section title="Observações" defaultOpen={false}>
        <Textarea {...register("observacoes")} rows={3} placeholder="Notas livres..." />
      </Section>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background py-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {mode === "create" ? "Salvar e abrir lead" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
