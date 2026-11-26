import { apiRequest } from './api';
import {
  converterDesafio,
  type Desafio,
  type DesafioApi,
  type NovoDesafioPayload,
  type RespostaPaginada,
} from '../types/desafio';

export async function listarDesafios(): Promise<Desafio[]> {
  const desafios: Desafio[] = [];
  let paginas = 1;
  for (let pagina = 1; pagina <= paginas; pagina++) {
    const resposta = await apiRequest<RespostaPaginada<DesafioApi> | DesafioApi[]>(
      `/desafios?page=${pagina}&page_size=100`
    );
    const lista = Array.isArray(resposta) ? resposta : resposta?.items;
    if (!Array.isArray(lista)) {
      throw new Error('A API retornou uma lista de desafios em formato inválido.');
    }
    desafios.push(...lista.map(converterDesafio));
    paginas = Array.isArray(resposta) ? 1 : resposta.pages ?? 1;
  }
  return desafios;
}

export async function cadastrarDesafio(
  dados: NovoDesafioPayload
): Promise<void> {
  await apiRequest<unknown>('/desafios', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function consultarDesafio(id: string): Promise<DesafioApi> {
  return apiRequest<DesafioApi>(`/desafios/${encodeURIComponent(id)}`);
}

export function atualizarDesafio(id: string, dados: Partial<Omit<NovoDesafioPayload, 'email'>>): Promise<DesafioApi> {
  return apiRequest(`/desafios/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export async function excluirDesafio(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error('ID do desafio inválido.');
  }

  await apiRequest<unknown>(
    `/desafios/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}
