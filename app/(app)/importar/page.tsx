"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = Record<string, string>;
const aliases: Record<string, string> = {
  empresa: "company", loja: "company", nome_da_empresa: "company", nome: "contact_name",
  contato: "contact_name", responsável: "contact_name", telefone: "phone", whatsapp: "phone",
  celular: "phone", email: "email", e_mail: "email", instagram: "instagram",
  cidade: "city", uf: "state", estado: "state", nicho: "niche", segmento: "niche",
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseLine(line: string, separator: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { current += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === separator && !quoted) { values.push(current.trim()); current = ""; }
    else current += char;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text: string): Row[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const separator = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const headers = parseLine(lines[0], separator).map((header) => aliases[normalize(header)] ?? normalize(header));
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line, separator)[index] ?? ""]))).filter((row) => Object.values(row).some(Boolean));
}

export default function ImportarPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [listName, setListName] = useState(`Lista ${new Date().toLocaleDateString("pt-BR")}`);
  const [loading, setLoading] = useState(false);
  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = parseCsv(await file.text());
    setRows(parsed);
    setListName(file.name.replace(/\.(csv|txt)$/i, ""));
    if (!parsed.length) toast.error("Não encontrei linhas válidas no arquivo");
  }

  async function handleImport() {
    if (!rows.length || !listName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import_contacts", payload: { list_name: listName, source: "Prospecção ativa", pipeline: "prospeccao", rows } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha na importação");
      toast.success(`${data.result.imported} contatos importados; ${data.result.skipped} duplicados ignorados`);
      setRows([]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao importar"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div><h1 className="text-xl font-semibold">Importar lista</h1><p className="text-sm text-muted-foreground">Envie CSV exportado do Excel ou Google Sheets. Duplicados serão ignorados.</p></div>
      <Card><CardHeader><CardTitle className="text-base">1. Selecionar arquivo</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center hover:bg-accent">
          <FileSpreadsheet className="size-8 text-muted-foreground" /><span className="text-sm font-medium">Escolher arquivo CSV</span><span className="text-xs text-muted-foreground">Colunas reconhecidas: empresa, contato, telefone, e-mail, Instagram, cidade, UF e nicho</span>
          <input type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={handleFile} />
        </label>
      </CardContent></Card>
      {rows.length > 0 && <Card><CardHeader><CardTitle className="text-base">2. Revisar e importar ({rows.length} linhas)</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="listName">Nome da lista</Label><Input id="listName" value={listName} onChange={(event) => setListName(event.target.value)} /></div>
        <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[700px] text-sm"><thead className="bg-muted"><tr>{Object.keys(preview[0] ?? {}).map((key) => <th key={key} className="px-3 py-2 text-left">{key}</th>)}</tr></thead><tbody>{preview.map((row, index) => <tr key={index} className="border-t border-border">{Object.keys(preview[0] ?? {}).map((key) => <td key={key} className="px-3 py-2">{row[key] || "—"}</td>)}</tr>)}</tbody></table></div>
        <Button onClick={handleImport} disabled={loading}><Upload className="size-4" />{loading && <Loader2 className="size-4 animate-spin" />}Importar {rows.length} contatos</Button>
      </CardContent></Card>}
    </div>
  );
}
