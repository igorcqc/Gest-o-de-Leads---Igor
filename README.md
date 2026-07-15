# CRM de Prospecção & Leads — Lojas de Móveis Planejados

Sistema pessoal de gestão de leads e prospecção para lojas de móveis planejados. Unifica dois fluxos em uma única base: leads gerados por **anúncio** (clientes das lojas atendidas) e prospecção ativa via **Instagram** (novas lojas a fechar como clientes).

Usuário único, protegido por senha via variável de ambiente.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (componentes locais em `components/ui`, sem CLI — ver nota abaixo)
- Supabase (Postgres)
- TanStack Query
- Zod + react-hook-form
- @dnd-kit (Kanban drag-and-drop)
- bcryptjs + jsonwebtoken (autenticação por senha única)

> Nota: os componentes shadcn/ui foram criados manualmente em `components/ui` (equivalentes ao que `npx shadcn add` geraria) porque o ambiente de build não teve acesso de rede ao registry `ui.shadcn.com`. Funcionam normalmente com `npx shadcn add <componente>` se precisar adicionar mais.

## Setup local

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Copiar `.env.local.example` para `.env.local` e preencher:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   APP_PASSWORD=
   APP_SECRET=
   ```
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase → Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase → Settings → API → **service_role** (secreta, nunca expor no client).
   - `APP_PASSWORD`: a senha de acesso ao sistema.
   - `APP_SECRET`: string aleatória de 32+ chars (`openssl rand -hex 32`) usada para assinar o JWT de sessão.
3. Rodar o schema SQL (`supabase/schema.sql`) no SQL Editor do Supabase — já aplicado no projeto `crm-planejados` criado durante o desenvolvimento.
4. `npm run dev` e acessar `http://localhost:3000`.

## Estrutura

```
app/
  (auth)/login/            página de login
  (app)/                   dashboard, leads, lixeira (protegidos pelo proxy.ts)
  api/                     rotas de API (leads, interações, dashboard, auth)
components/
  ui/                      componentes shadcn/ui
  kanban/                  KanbanBoard, KanbanColumn, LeadCard
  leads/                   LeadForm, LeadFilters, LeadTimeline, PainScoreSlider, TagsInput...
  dashboard/                HojeWidget, KPICards, AtividadeRecente
lib/
  supabase.ts              cliente server (service_role)
  supabase-browser.ts       cliente browser (anon key)
  auth.ts                  hash/verify de senha + JWT de sessão
  cadencia.ts              cálculo de próximo follow-up por status
  types.ts / validations.ts  tipos e schemas Zod compartilhados
  filters.ts               filtros salvos (localStorage)
supabase/schema.sql         schema completo (tabelas, índices, triggers)
proxy.ts                    proteção de rotas (equivalente ao middleware.ts do Next 15)
```

## Modelo de dados

Duas tabelas: `leads` e `interacoes`. Ver `supabase/schema.sql` para o schema completo (com RLS habilitado — o app acessa via `service_role` no servidor, que sempre ignora RLS; a chave `anon` fica sem acesso direto às tabelas).

`origem` do lead: `anuncio` | `prospeccao_instagram` | `indicacao` | `organico`.

## Deploy

1. Subir o repositório para o GitHub (branch já configurada).
2. Importar o projeto na Vercel.
3. Configurar as 5 variáveis de ambiente do `.env.local` no painel da Vercel.
4. Deploy automático a cada push.
