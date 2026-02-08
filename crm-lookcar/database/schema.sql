CREATE TABLE IF NOT EXISTS origens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS regioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS distritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  regiao_id UUID REFERENCES regioes(id),
  ilha TEXT
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  regiao TEXT,
  origem_id UUID REFERENCES origens(id),
  estado_funil TEXT,
  financiamento BOOLEAN,
  tem_retoma BOOLEAN,
  valor_retoma NUMERIC,
  modo_pagamento TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_ultimo_contacto TIMESTAMP,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  valor_negocio_previsto NUMERIC,
  modo_pagamento TEXT,
  tem_retoma BOOLEAN,
  valor_retoma NUMERIC,
  estado TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_fecho_prevista TIMESTAMP,
  data_fecho_real TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  titulo TEXT,
  descricao TEXT,
  data_hora_inicio TIMESTAMP,
  data_hora_fim TIMESTAMP,
  tipo TEXT,
  origem_agenda TEXT,
  criado_por TEXT
);
