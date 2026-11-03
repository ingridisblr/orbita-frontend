// Status devolvidos pela API (a tela exibe o rótulo via rotuloStatusIdeia)
export type StatusIdeia =
  | 'submetida'
  | 'rascunho'
  | 'nova'
  | 'em_avaliacao'
  | 'aprovada'
  | 'arquivada';

// Ideia como devolvida pela API (/ideias)
export interface Ideia {
  id_ideia:           number;
  codigo:             string | null;
  id_autor:           number;
  id_desafio:         number;
  desafio_titulo:     string | null;
  titulo:             string;
  descricao:          string;
  area:               string | null;
  categoria:          string | null;
  problema_resolvido: string | null;
  beneficio_esperado: string | null;
  status:             string;
  data_criacao:       string | null;
  data_atualizacao:   string | null;
}

// Corpo de POST /ideias e PATCH /ideias/:id
export interface IdeiaPayload {
  id_desafio:          number;
  titulo:              string;
  descricao:           string;
  area?:               string | null;
  categoria?:          string | null;
  problema_resolvido?: string | null;
  beneficio_esperado?: string | null;
}

export interface IdeiasPaginadas {
  items:     Ideia[];
  page:      number;
  page_size: number;
  total:     number;
  pages:     number;
}
