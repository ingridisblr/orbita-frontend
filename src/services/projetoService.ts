import { apiRequest } from './api';

export const etapasProjeto = ['Aprovado', 'Planejamento', 'Em Desenvolvimento', 'Em Teste', 'Concluído'] as const;
export type EtapaProjeto = (typeof etapasProjeto)[number];

export interface ProjetoApi {
  id_projeto: number;
  id_match: number;
  id_desafio: number | null;
  id_responsavel: number;
  responsavel_nome: string | null;
  titulo: string;
  descricao: string | null;
  status_kanban: EtapaProjeto;
  data_prazo: string | null;
}

export interface ProjetoDetalhadoApi extends ProjetoApi {
  historico: {
    id_movimentacao: number;
    etapa_origem: EtapaProjeto;
    etapa_destino: EtapaProjeto;
    data_movimentacao: string | null;
  }[];
}

export async function listarProjetos(): Promise<ProjetoApi[]> {
  const projetos: ProjetoApi[] = [];
  let paginas = 1;
  for (let pagina = 1; pagina <= paginas; pagina++) {
    const resposta = await apiRequest<{ items: ProjetoApi[]; pages: number }>(
      `/projetos?page=${pagina}&page_size=100`,
    );
    projetos.push(...resposta.items);
    paginas = resposta.pages;
  }
  return projetos;
}

export function criarProjeto(dados: { id_match: number; titulo?: string; data_prazo?: string }): Promise<ProjetoApi> {
  return apiRequest('/projetos', { method: 'POST', body: JSON.stringify(dados) });
}

export function moverProjeto(id: string, etapa: EtapaProjeto): Promise<ProjetoApi> {
  return apiRequest(`/projetos/${encodeURIComponent(id)}/kanban`, {
    method: 'PATCH',
    body: JSON.stringify({ etapa }),
  });
}

export function consultarProjeto(id: string): Promise<ProjetoDetalhadoApi> {
  return apiRequest(`/projetos/${encodeURIComponent(id)}`);
}

export function atualizarProjeto(id: string, dados: { titulo: string; descricao: string | null; data_prazo: string | null }): Promise<ProjetoDetalhadoApi> {
  return apiRequest(`/projetos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}
