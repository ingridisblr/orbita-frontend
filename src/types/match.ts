// Match como devolvido pela API (/matches)
export interface Match {
  id_match:              number;
  id_ideia:              number;
  ideia_codigo:          string | null;
  ideia_titulo:          string | null;
  id_desafio:            number;
  desafio_titulo:        string | null;
  id_validado_por:       number | null;
  score_compatibilidade: number | null;
  justificativa:         string | null;
  origem_match:          string;
  status_match:          string;
  data_criacao:          string | null;
  data_validacao:        string | null;
}

// Corpo de POST /matches
export interface MatchPayload {
  id_ideia:       number;
  id_desafio:     number;
  justificativa?: string | null;
}

export interface MatchesPaginados {
  items:     Match[];
  page:      number;
  page_size: number;
  total:     number;
  pages:     number;
}
