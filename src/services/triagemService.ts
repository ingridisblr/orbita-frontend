import { apiRequest } from './api';

export type DecisaoApi = 'ajustes' | 'reprovada' | 'aprovada';
export type CriterioTriagem = 'impacto' | 'urgencia' | 'viabilidade' | 'alinhamento' | 'esforco';

type TriagemPayload = Record<CriterioTriagem, number> & {
  id_match: number;
  parecer: string;
  decisao: DecisaoApi;
};

type TriagemApi = Omit<TriagemPayload, 'decisao'> & {
  id_triagem: number;
  id_ideia: number;
  id_desafio: number;
  decisao: DecisaoApi | null;
  data_avaliacao: string;
};

export async function listarTriagens(): Promise<TriagemApi[]> {
  const triagens: TriagemApi[] = [];
  let paginas = 1;
  for (let pagina = 1; pagina <= paginas; pagina++) {
    const resposta = await apiRequest<{ items: TriagemApi[]; pages: number }>(
      `/triagens?page=${pagina}&page_size=100`,
    );
    triagens.push(...resposta.items);
    paginas = resposta.pages;
  }
  return triagens;
}

export function registrarTriagem(dados: TriagemPayload): Promise<TriagemApi> {
  return apiRequest('/triagens', { method: 'POST', body: JSON.stringify(dados) });
}
