"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task { id: string; contact_id: string | null; title: string; priority: string; due_at: string | null; status: string; company?: string; notes?: string }
interface Contact { id: string; company: string }

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("none");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/crm"); const data = await response.json();
    setTasks(data.tasks ?? []); setContacts(data.contacts ?? []); setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/crm")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setTasks(data.tasks ?? []);
        setContacts(data.contacts ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        toast.error("Não foi possível carregar as tarefas");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function action(actionName: string, payload: Record<string, unknown>) {
    const response = await fetch("/api/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: actionName, payload }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Erro na tarefa"); return data;
  }
  async function createTask() {
    if (!title.trim()) return;
    try { await action("create_task", { title, contact_id: contactId === "none" ? null : contactId, due_at: dueAt || null, priority }); setTitle(""); setDueAt(""); toast.success("Tarefa criada"); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao criar tarefa"); }
  }
  async function completeTask(id: string, completed: boolean) {
    try { await action("complete_task", { id, completed }); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao atualizar tarefa"); }
  }
  if (loading) return <Loader2 className="size-5 animate-spin" />;
  const pending = tasks.filter((task) => task.status === "pending");
  const completed = tasks.filter((task) => task.status === "completed");
  return <div className="mx-auto flex max-w-5xl flex-col gap-5">
    <div><h1 className="text-xl font-semibold">Tarefas e follow-ups</h1><p className="text-sm text-muted-foreground">Tudo que precisa acontecer, com prazo e prioridade.</p></div>
    <Card><CardHeader><CardTitle className="text-base">Nova tarefa</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="flex flex-col gap-1.5 md:col-span-2"><Label htmlFor="title">Tarefa</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex: Retornar proposta" /></div>
      <div className="flex flex-col gap-1.5"><Label>Contato</Label><Select value={contactId} onValueChange={setContactId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem contato</SelectItem>{contacts.map((contact) => <SelectItem key={contact.id} value={contact.id}>{contact.company}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex flex-col gap-1.5"><Label>Prioridade</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem></SelectContent></Select></div>
      <div className="flex flex-col gap-1.5 md:col-span-2"><Label htmlFor="dueAt">Prazo</Label><Input id="dueAt" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></div>
      <div className="flex items-end md:col-span-2"><Button onClick={createTask} disabled={!title.trim()}><Plus className="size-4" />Criar tarefa</Button></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Pendentes ({pending.length})</CardTitle></CardHeader><CardContent className="space-y-2">{pending.length ? pending.map((task) => <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3"><div><p className="text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{[task.company, task.due_at ? new Date(task.due_at).toLocaleString("pt-BR") : null, task.priority].filter(Boolean).join(" · ")}</p></div><Button size="sm" variant="outline" onClick={() => completeTask(task.id, true)}><Check className="size-4" />Concluir</Button></div>) : <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma tarefa pendente</p>}</CardContent></Card>
    {completed.length > 0 && <Card><CardHeader><CardTitle className="text-base">Concluídas</CardTitle></CardHeader><CardContent className="space-y-2">{completed.slice(0, 20).map((task) => <button key={task.id} type="button" onClick={() => completeTask(task.id, false)} className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left opacity-60"><span className="text-sm line-through">{task.title}</span><span className="text-xs">Reabrir</span></button>)}</CardContent></Card>}
  </div>;
}
