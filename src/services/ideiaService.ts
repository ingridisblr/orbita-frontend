import { apiRequest } from './api';
import {
  converterIdeia,
  type CriarIdeiaPayload,
  type Ideia,
  type IdeiaApi,
} from '../types/ideia';

interface ListarIdeiasOpcoes {
  minhas?: boolean;
  page?: number;
  pageSize?: number;
  desafioId?: string;
}

function extrairLista(resposta: unknown): IdeiaApi[] {
  if (Array.isArray(resposta)) {
    return resposta as IdeiaApi[];
  }

  if (typeof resposta !== 'object' || resposta === null) {
    return [];
  }

  const objeto = resposta as Record<string, unknown>;

  for (const chave of [
    'ideias',
    'items',
    'results',
    'data',
    'registros',
  ]) {
    const valor = objeto[chave];

    if (Array.isArray(valor)) {
      return valor as IdeiaApi[];
    }

    if (valor && typeof valor === 'object') {
      const aninhado = extrairLista(valor);

      if (aninhado.length > 0) {
        return aninhado;
      }
    }
  }

  return [];
}

export async function listarIdeias(
  opcoes: ListarIdeiasOpcoes = {}
): Promise<Ideia[]> {
  return (await consultarPaginaIdeias(opcoes)).ideias;
}

async function consultarPaginaIdeias(opcoes: ListarIdeiasOpcoes) {
  const parametros = new URLSearchParams({
    page: String(opcoes.page ?? 1),
    page_size: String(opcoes.pageSize ?? 100),
  });

  if (opcoes.minhas) {
    parametros.set('minhas', 'true');
  }

  if (opcoes.desafioId) {
    parametros.set('id_desafio', opcoes.desafioId);
  }

  const resposta = await apiRequest<unknown>(
    `/ideias?${parametros.toString()}`
  );

  const paginas = (resposta as { pages?: unknown } | null)?.pages;
  return {
    ideias: extrairLista(resposta).map(converterIdeia),
    paginas: typeof paginas === 'number' ? paginas : 1,
  };
}

export async function cadastrarIdeia(
  dados: CriarIdeiaPayload
): Promise<void> {
  await apiRequest<unknown>('/ideias', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function consultarIdeia(id: string): Promise<Ideia> {
  const resposta = await apiRequest<IdeiaApi>(
    `/ideias/${encodeURIComponent(id)}`
  );

  return converterIdeia(resposta);
}

export async function atualizarIdeia(
  id: string,
  dados: Partial<CriarIdeiaPayload>,
  metodo: 'PUT' | 'PATCH' = 'PATCH'
): Promise<Ideia> {
  const resposta = await apiRequest<IdeiaApi>(
    `/ideias/${encodeURIComponent(id)}`,
    {
      method: metodo,
      body: JSON.stringify(dados),
    }
  );

  return converterIdeia(resposta);
}

export async function arquivarIdeia(id: string): Promise<Ideia> {
  const resposta = await apiRequest<IdeiaApi>(
    `/ideias/${encodeURIComponent(id)}/arquivar`,
    { method: 'POST' }
  );
  return converterIdeia(resposta);
}

export async function aceitarIdeia(id: string): Promise<void> {
  await apiRequest<unknown>(`/ideias/${encodeURIComponent(id)}/aceitar`, {
    method: 'POST',
  });
}

export async function rejeitarIdeia(id: string): Promise<void> {
  await apiRequest<unknown>(`/ideias/${encodeURIComponent(id)}/rejeitar`, {
    method: 'POST',
  });
}

export async function arquivarIdeiaComDelete(
  id: string
): Promise<void> {
  await apiRequest<unknown>(
    `/ideias/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}

export async function aprovarIdeia(id: string): Promise<Ideia> {
  const resposta = await apiRequest<IdeiaApi>(
    `/ideias/${encodeURIComponent(id)}/aprovar`,
    { method: 'POST' }
  );

  return converterIdeia(resposta);
}

// Todas as ideias visíveis ao usuário (o Analista/Hub vê todas),
// percorrendo as páginas de até 100 itens
export async function listarTodasIdeias(
  filtros: Pick<ListarIdeiasOpcoes, 'minhas' | 'desafioId'> = {},
): Promise<Ideia[]> {
  const todas: Ideia[] = [];
  let totalPaginas = 1;

  for (let page = 1; page <= totalPaginas; page++) {
    const { ideias, paginas } = await consultarPaginaIdeias({ ...filtros, page });
    todas.push(...ideias);
    totalPaginas = paginas;
  }

  return todas;
}
