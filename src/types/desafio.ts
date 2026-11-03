// Desafio como devolvido por GET /desafio/listar_todos
export interface Desafio {
  id_desafio:         number;
  id_responsavel:     number;
  titulo:             string;
  descricao_problema: string;
  area_demandante:    string;
  quem_afeta:         string | null;
  impacto:            string | null;
  urgencia:           string | null;
  categoria:          string | null;
  status:             string;
  qtd_ideias:         number;
  data_criacao:       string | null;
  data_atualizacao:   string | null;
}

// Campos enviados no cadastro/atualização de um desafio
export interface DesafioPayload {
  titulo:             string;
  descricao_problema: string;
  area_demandante:    string;
  quem_afeta?:        string | null;
  impacto?:           string | null;
  urgencia?:          string | null;
  categoria?:         string | null;
  status?:            string;
}
