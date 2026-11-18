export interface RespostaPaginada<T> {
  items: T[];
  total?: number;
  page?: number;
  pages?: number;
}

export interface DesafioApi {
  id_desafio: number | string;
  titulo: string;
  descricao_problema: string;
  area_demandante: string;
  quem_afeta: string;
  impacto: string;
  urgencia: string;
  categoria: string;
  status: string;
  data_criacao?: string | null;
  data_atualizacao?: string | null;
  id_responsavel?: number | string | null;
}

export interface Desafio {
  id: string;
  titulo: string;
  descricao: string;
  areaDemandante: string;
  quemAfeta: string;
  impacto: string;
  urgencia: string;
  categoria: string;
  status: string;
  dataCriacao: string;
}

export interface NovoDesafioPayload {
  email: string;
  titulo: string;
  descricao_problema: string;
  area_demandante: string;
  quem_afeta: string;
  impacto: string;
  urgencia: string;
  categoria: string;
  status: 'aberto' | 'ativo';
}

export function converterDesafio(dado: DesafioApi): Desafio {
  const data = dado.data_criacao ? new Date(dado.data_criacao) : null;
  const dataCriacao =
    data && !Number.isNaN(data.getTime())
      ? data.toLocaleDateString('pt-BR')
      : '';

  return {
    id: String(dado.id_desafio),
    titulo: dado.titulo ?? '',
    descricao: dado.descricao_problema ?? '',
    areaDemandante: dado.area_demandante ?? '',
    quemAfeta: dado.quem_afeta ?? '',
    impacto: dado.impacto ?? '',
    urgencia: dado.urgencia ?? '',
    categoria: dado.categoria ?? '',
    status: dado.status ?? '',
    dataCriacao,
  };
}