
import { apiRequest } from './api';
import { listarDesafios } from './desafioService';
import type { Desafio } from '../types/desafio';
import type {
  Match,
  MatchPayload,
  MatchesPaginados,
} from '../types/match';

const TAMANHO_PAGINA = 100; // máximo aceito pela API
const LIMITE_PAGINAS = 50; // trava de segurança contra laço infinito

// GET /matches (uma página)
export async function listarMatches(
  page = 1,
  pageSize = 10,
  idDesafio?: number
): Promise<MatchesPaginados> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (idDesafio) {
    params.set('id_desafio', String(idDesafio));
  }

  return apiRequest<MatchesPaginados>(
    `/matches?${params.toString()}`
  );
}

// Todos os vínculos existentes, percorrendo as páginas da API
export async function listarTodosMatches(): Promise<Match[]> {
  const todos: Match[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const resposta = await listarMatches(pagina, TAMANHO_PAGINA);

    todos.push(...resposta.items);
    totalPaginas = resposta.pages;
    pagina += 1;
  } while (
    pagina <= totalPaginas &&
    pagina <= LIMITE_PAGINAS
  );

  return todos;
}

// GET /matches/:id
export async function obterMatch(
  idMatch: number
): Promise<Match> {
  return apiRequest<Match>(`/matches/${idMatch}`);
}

// POST /matches: relaciona uma ideia a um desafio
export async function criarMatch(
  payload: MatchPayload
): Promise<Match> {
  return apiRequest<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}


export async function listarDesafiosParaMatch(): Promise<Desafio[]> {
  return listarDesafios();
}
