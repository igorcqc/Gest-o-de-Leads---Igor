"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Settings { monthly_mrr_target: number; daily_new_contacts_target: number; daily_followups_target: number; sla_target_minutes: number }
const defaults: Settings = { monthly_mrr_target: 10000, daily_new_contacts_target: 30, daily_followups_target: 5, sla_target_minutes: 15 };

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/crm").then((response) => response.json()).then((data) => {
      if (data.settings) setSettings({ ...defaults, ...data.settings });
    }).catch(() => toast.error("Não foi possível carregar as configurações")).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_settings", payload: settings }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar");
      toast.success("Metas atualizadas");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar"); }
    finally { setSaving(false); }
  }

  function numberField(key: keyof Settings, label: string, suffix?: string) {
    return <div className="flex flex-col gap-1.5"><Label htmlFor={key}>{label}</Label><div className="flex items-center gap-2"><Input id={key} type="number" min={1} value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: Number(event.target.value) }))} />{suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}</div></div>;
  }

  if (loading) return <Loader2 className="size-5 animate-spin" />;
  return <div className="mx-auto flex max-w-3xl flex-col gap-5">
    <div><h1 className="text-xl font-semibold">Configurações</h1><p className="text-sm text-muted-foreground">Metas da operação, SLA e segurança dos dados.</p></div>
    <Card><CardHeader><CardTitle className="text-base">Metas comerciais</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {numberField("monthly_mrr_target", "Meta mensal de receita", "R$")}
      {numberField("daily_new_contacts_target", "Novos contatos por dia")}
      {numberField("daily_followups_target", "Follow-ups por dia")}
      {numberField("sla_target_minutes", "SLA do primeiro atendimento", "min")}
      <div className="sm:col-span-2"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar configurações</Button></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4" />Dados e segurança</CardTitle></CardHeader><CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
      <p>O banco usa schema privado, controle por linha e segredo validado por hash. A chave administrativa do Supabase não é usada pelo aplicativo.</p>
      <Button asChild variant="outline" className="w-fit"><a href="/api/export"><Download className="size-4" />Baixar backup CSV</a></Button>
    </CardContent></Card>
  </div>;
}
