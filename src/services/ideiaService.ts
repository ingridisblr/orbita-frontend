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
  const parametros = new URLSearchParams({
    page: String(opcoes.page ?? 1),
    page_size: String(opcoes.pageSize ?? 100),
  });

  if (opcoes.minhas) {
    parametros.set('minhas', 'true');
  }

  if (opcoes.desafioId) {
    parametros.set('desafio', opcoes.desafioId);
  }

  const resposta = await apiRequest<unknown>(
    `/ideias?${parametros.toString()}`
  );

  return extrairLista(resposta).map(converterIdeia);
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

export async function arquivarIdeia(id: string): Promise<void> {
  await apiRequest<unknown>(
    `/ideias/${encodeURIComponent(id)}/arquivar`,
    { method: 'POST' }
  );
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
export async function listarTodasIdeias(): Promise<Ideia[]> {
  const todas: Ideia[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const parametros = new URLSearchParams({
      page:      String(pagina),
      page_size: '100',
    });

    const resposta = await apiRequest<unknown>(
      `/ideias?${parametros.toString()}`
    );

    todas.push(...extrairLista(resposta).map(converterIdeia));

    const paginas = (resposta as { pages?: unknown } | null)?.pages;
    totalPaginas = typeof paginas === 'number' ? paginas : 1;
    pagina += 1;
  } while (pagina <= totalPaginas && pagina <= 50);

  return todas;
}
