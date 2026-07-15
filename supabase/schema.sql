-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  cidade text,
  origem text NOT NULL CHECK (origem IN ('anuncio','prospeccao_instagram','indicacao','organico')),
  status text NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','em_contato','respondeu','qualificado','proposta','negociacao','fechado','perdido')),
  ambiente text CHECK (ambiente IN ('cozinha','quarto','escritorio','closet','sala','gourmet','banheiro','lavanderia','varios')),
  valor_estimado numeric(12,2),
  etapa_obra text CHECK (etapa_obra IN ('sonhando','planejando','em_obra','pronta')),
  prazo text CHECK (prazo IN ('imediato','30_dias','60_90_dias','sem_pressa')),
  dor_principal text,
  gargalo text,
  ja_investe_ads boolean DEFAULT false,
  tamanho_loja text CHECK (tamanho_loja IN ('1_loja','2_3_lojas','4_mais_lojas')),
  observacoes text,
  tags text[] DEFAULT '{}'::text[],
  pain_score integer CHECK (pain_score BETWEEN 0 AND 10),
  proximo_followup timestamptz,
  followup_ativo boolean NOT NULL DEFAULT true,
  status_detalhado jsonb,
  instagram_handle text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de interações
CREATE TABLE interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tipo text NOT NULL
    CHECK (tipo IN ('dm_enviado','followup','nota','mudanca_status','call','reuniao','proposta','outro')),
  descricao text NOT NULL,
  canal text CHECK (canal IN ('instagram','whatsapp','telefone','email','presencial','outro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Índices
CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_origem ON leads(origem) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_proximo_followup ON leads(proximo_followup) WHERE followup_ativo = true AND deleted_at IS NULL;
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_interacoes_lead_id ON interacoes(lead_id, created_at DESC) WHERE deleted_at IS NULL;

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Log automático de mudança de status
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO interacoes(lead_id, tipo, descricao)
    VALUES (NEW.id, 'mudanca_status', 'Status mudou de ' || OLD.status || ' para ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_status_change
AFTER UPDATE OF status ON leads
FOR EACH ROW EXECUTE FUNCTION log_status_change();
