
export type StatusIdeia =
  | 'Submetida'
  | 'Em Match'
  | 'Em Triagem'
  | 'Aprovada'
  | 'Em Desenvolvimento'
  | 'Arquivada';

export interface Ideia {
  id:                string;
  titulo:            string;
  descricao:         string;
  desafioId:         string;
  desafio:           string;
  areaOrigem:        string;
  categoria:         string;
  beneficioEsperado: string;
  status:            StatusIdeia;
  data:              string;

  usuarioId: string;
}
