import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { STATUS_ORDER } from "@/lib/types";

export async function GET() {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(inicioHoje);
  fimHoje.setDate(fimHoje.getDate() + 1);
  const seteDiasAtras = new Date(inicioHoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [
    atrasadosRes,
    hojeRes,
    reativarRes,
    callsRes,
    leadsAtivosRes,
    clientesAtivosRes,
    criadosNoMesRes,
    fechadosNoMesRes,
    atividadeRecenteRes,
  ] = await Promise.all([
    supabaseServer
      .from("leads")
      .select("id,nome,cidade,telefone,status,proximo_followup")
      .is("deleted_at", null)
      .eq("followup_ativo", true)
      .lt("proximo_followup", inicioHoje.toISOString())
      .order("proximo_followup", { ascending: true }),
    supabaseServer
      .from("leads")
      .select("id,nome,cidade,telefone,status,proximo_followup")
      .is("deleted_at", null)
      .eq("followup_ativo", true)
      .gte("proximo_followup", inicioHoje.toISOString())
      .lt("proximo_followup", fimHoje.toISOString())
      .order("proximo_followup", { ascending: true }),
    supabaseServer
      .from("leads")
      .select("id,nome,cidade,telefone,status,updated_at")
      .is("deleted_at", null)
      .eq("followup_ativo", true)
      .lt("updated_at", seteDiasAtras.toISOString())
      .not("status", "in", "(fechado,perdido)")
      .order("updated_at", { ascending: true }),
    supabaseServer
      .from("interacoes")
      .select("id,lead_id,tipo,descricao,created_at,leads(id,nome,cidade,telefone)")
      .in("tipo", ["call", "reuniao"])
      .is("deleted_at", null)
      .gte("created_at", inicioHoje.toISOString())
      .lt("created_at", fimHoje.toISOString()),
    supabaseServer
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .not("status", "in", "(fechado,perdido)"),
    supabaseServer
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "fechado"),
    supabaseServer
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", inicioMes.toISOString()),
    supabaseServer
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "fechado")
      .gte("updated_at", inicioMes.toISOString()),
    supabaseServer
      .from("interacoes")
      .select("id,tipo,descricao,created_at,leads(id,nome)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const funilRes = await supabaseServer
    .from("leads")
    .select("status")
    .is("deleted_at", null)
    .gte("created_at", inicioMes.toISOString());

  const firstError = [
    atrasadosRes,
    hojeRes,
    reativarRes,
    callsRes,
    leadsAtivosRes,
    clientesAtivosRes,
    criadosNoMesRes,
    fechadosNoMesRes,
    atividadeRecenteRes,
    funilRes,
  ].find((res) => res.error)?.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const funilDoMes = STATUS_ORDER.map((status) => ({
    status,
    total: (funilRes.data ?? []).filter((lead) => lead.status === status).length,
  }));

  const criados = criadosNoMesRes.count ?? 0;
  const fechados = fechadosNoMesRes.count ?? 0;
  const taxaConversao = criados > 0 ? Math.round((fechados / criados) * 1000) / 10 : 0;

  return NextResponse.json({
    hoje: {
      atrasados: atrasadosRes.data ?? [],
      hoje: hojeRes.data ?? [],
      reativar: reativarRes.data ?? [],
      calls: callsRes.data ?? [],
    },
    kpis: {
      leadsAtivos: leadsAtivosRes.count ?? 0,
      clientesAtivos: clientesAtivosRes.count ?? 0,
      taxaConversao,
      funilDoMes,
    },
    atividadeRecente: atividadeRecenteRes.data ?? [],
  });
}
