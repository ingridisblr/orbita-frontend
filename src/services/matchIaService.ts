import { apiRequest } from './api';
import {
  converterResultadoMatchIa,
  statusAposDecisao,
  type DecisaoMatch,
  type ResultadoMatchIa,
  type SugerirMatchIaApi,
  type ValidacaoMatchApi,
} from '../types/matchIa';

export const TOP_N_PADRAO = 5;

// A IA tem 10 s no backend. Em caso de falha (503/504) a API devolve a
// mensagem em `erro`, que o apiRequest já repassa como Error.message.
export async function sugerirMatchesIa(
  desafioId: string,
  topN: number = TOP_N_PADRAO
): Promise<ResultadoMatchIa> {
  const id = Number(desafioId);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error('ID do desafio inválido.');
  }

  const resposta = await apiRequest<SugerirMatchIaApi>(
    '/ia/matches/sugerir-ia',
    {
      method: 'POST',
      body: JSON.stringify({ id_desafio: id, top_n: topN }),
    }
  );

  if (!resposta || !Array.isArray(resposta.sugestoes)) {
    throw new Error('A API retornou as sugestões da IA em formato inválido.');
  }

  return converterResultadoMatchIa(resposta);
}

// Revisão humana da sugestão: o Analista valida ou descarta (com motivo).
export async function revisarMatch(
  matchId: string,
  decisao: DecisaoMatch,
  justificativa?: string
): Promise<string> {
  const id = Number(matchId);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error('ID do match inválido.');
  }

  const motivo = justificativa?.trim();

  if (decisao === 'descartar' && !motivo) {
    throw new Error('Informe o motivo do descarte.');
  }

  const resposta = await apiRequest<ValidacaoMatchApi | null>(
    `/matches/${id}/validacao`,
    {
      method: 'POST',
      body: JSON.stringify({
        decisao,
        ...(motivo ? { justificativa: motivo } : {}),
      }),
    }
  );

  const status = resposta?.status_match ?? resposta?.statusMatch;
  return (status ?? statusAposDecisao(decisao)).toUpperCase();
}
