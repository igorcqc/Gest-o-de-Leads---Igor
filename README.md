# CRM Protocolo 10K

CRM pessoal para centralizar prospecção ativa e leads de anúncios, acompanhar o funil, executar follow-ups, organizar tarefas e medir conversão.

## Recursos

- Dashboard diário com metas, SLA e valor estimado do pipeline
- Funis separados para prospecção e anúncios
- Cadastro, edição, busca, filtros, tags e qualificação de contatos
- Kanban, histórico de atividades e cadência manual de WhatsApp
- Tarefas com prazo e prioridade
- Importação CSV com deduplicação e exportação de backup
- Relatórios por etapa, origem, campanha e motivo de perda
- Webhook para integrações futuras com Make e Meta Lead Ads
- Lixeira com restauração antes da exclusão definitiva

## Segurança

- Banco em schema privado com Row Level Security
- Aplicação usa somente a chave publicável do Supabase
- Senha armazenada como bcrypt (custo 12), nunca no repositório
- Sessão opaca criptografada com AES-256-GCM em cookie `HttpOnly`, `Secure` e `SameSite=Strict`
- Rate limit de 5 tentativas de login por 15 minutos, com IP anonimizado
- CSP, bloqueio de iframe, `no-referrer` e bloqueio de indexação

## Desenvolvimento local

Requisitos: Node.js 20+ e uma variável `APP_SECRET` aleatória com no mínimo 32 caracteres.

```bash
npm ci
APP_SECRET="$(openssl rand -hex 32)" npm run dev
```

Acesse `http://localhost:3000`. A senha de acesso é administrada no banco e não fica em arquivo `.env`.

## Validação

```bash
npm run lint
APP_SECRET="$(openssl rand -hex 32)" npm run build
```

## Publicação

O projeto está ligado à Vercel e publica automaticamente após cada push na branch de produção. A única variável secreta exigida para o CRM é `APP_SECRET`. Para ativar o webhook, configure também uma `WEBHOOK_SECRET` independente e envie-a no header `x-webhook-secret`.

Nunca adicione ao frontend uma chave `service_role` do Supabase.
