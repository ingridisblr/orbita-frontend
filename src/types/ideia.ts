export type StatusIdeia =
  | 'Submetida'
  | 'Rascunho'
  | 'Nova'
  | 'Em Match'
  | 'Em Triagem'
  | 'Aprovada'
  | 'Em Desenvolvimento'
  | 'Arquivada'
  | string;

export interface Ideia {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  desafioId: string;
  desafio: string;
  areaOrigem: string;
  categoria: string;
  beneficioEsperado: string;
  status: StatusIdeia;
  data: string;
  usuarioId: string;
}

export interface CriarIdeiaPayload {
  id_desafio: number | string;
  titulo: string;
  descricao: string;
  area_origem?: string;
  categoria?: string;
  beneficio_esperado?: string;
}

export interface IdeiaApi {
  id_ideia?: number | string;
  id?: number | string;
  codigo?: string;
  titulo?: string;
  descricao?: string;
  descricao_ideia?: string;
  status?: string;
  id_desafio?: number | string;
  desafio_id?: number | string;
  titulo_desafio?: string;
  desafio?:
    | string
    | {
        id_desafio?: number | string;
        titulo?: string;
        titulo_desafio?: string;
      };
  area?: string;
  area_origem?: string;
  categoria?: string;
  beneficio_esperado?: string;
  problema_resolvido?: string;
  data_criacao?: string;
  created_at?: string;
  id_usuario?: number | string;
  id_autor?: number | string;
  usuario_id?: number | string;
  autor?: string | { id_usuario?: number | string; nome?: string };
}

function toId(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function formatDate(value?: string): string {
  if (!value) return '';

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('pt-BR');
}

export function converterIdeia(dado: IdeiaApi): Ideia {
  const desafioAninhado =
    typeof dado.desafio === 'object' && dado.desafio !== null
      ? dado.desafio
      : undefined;

  const autorAninhado =
    typeof dado.autor === 'object' && dado.autor !== null
      ? dado.autor
      : undefined;

  return {
    id: toId(dado.id_ideia ?? dado.id),
    codigo: toText(dado.codigo),
    titulo: toText(dado.titulo),
    descricao: toText(dado.descricao ?? dado.descricao_ideia),
    desafioId: toId(
      dado.id_desafio ?? dado.desafio_id ?? desafioAninhado?.id_desafio
    ),
    desafio: toText(
      dado.titulo_desafio ??
        (typeof dado.desafio === 'string' ? dado.desafio : undefined) ??
        desafioAninhado?.titulo ??
        desafioAninhado?.titulo_desafio
    ),
    areaOrigem: toText(dado.area_origem ?? dado.area),
    categoria: toText(dado.categoria),
    beneficioEsperado: toText(
      dado.beneficio_esperado ?? dado.problema_resolvido
    ),
    status: toText(dado.status).replace(/^./, (letra) => letra.toUpperCase()),
    data: formatDate(dado.data_criacao ?? dado.created_at),
    usuarioId: toId(
      dado.id_usuario ??
        dado.id_autor ??
        dado.usuario_id ??
        autorAninhado?.id_usuario
    ),
  };
}