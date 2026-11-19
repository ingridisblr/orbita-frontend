// #region Contrato da API (POST /ia/matches/sugerir-ia)
export interface SugestaoIaApi {
  sugestaoId: string;
  matchId: number | string;
  ideiaId: number | string;
  demandaId: number | string;
  ideiaTitulo: string;
  scoreCompatibilidade: number; // 0.00 a 1.00
  justificativa: string;
  statusMatch: string;
}

export interface AiMetadataApi {
  modeloVersao: string;
  grauConfianca: number; // 0 a 100 (média dos scores)
  humanInTheLoop: boolean;
  generatedAt: string;
}

export interface SugerirMatchIaApi {
  sugestoes: SugestaoIaApi[];
  aiMetadata: AiMetadataApi;
}
// #endregion

// #region Revisão humana (POST /matches/<id>/validacao)
export type DecisaoMatch = 'validar' | 'descartar';

export interface ValidacaoMatchApi {
  status_match?: string;
  statusMatch?: string;
}

export function statusAposDecisao(decisao: DecisaoMatch): string {
  return decisao === 'validar' ? 'VALIDADO' : 'DESCARTADO';
}
// #endregion

// #region Modelo usado pela interface
export interface SugestaoIa {
  id: string;
  matchId: string;
  ideiaId: string;
  desafioId: string;
  ideiaTitulo: string;
  scorePercentual: number; // 0 a 100
  justificativa: string;
  status: string;
}

export interface ResultadoMatchIa {
  sugestoes: SugestaoIa[];
  modelo: string;
  confianca: number;
  humanInTheLoop: boolean;
  geradoEm: string;
}
// #endregion

// #region Conversão
export function converterSugestaoIa(dado: SugestaoIaApi): SugestaoIa {
  return {
    id: String(dado.sugestaoId),
    matchId: String(dado.matchId),
    ideiaId: String(dado.ideiaId),
    desafioId: String(dado.demandaId),
    ideiaTitulo: dado.ideiaTitulo ?? '',
    scorePercentual: Math.round((dado.scoreCompatibilidade ?? 0) * 100),
    justificativa: dado.justificativa ?? '',
    status: dado.statusMatch ?? '',
  };
}

export function converterResultadoMatchIa(
  dado: SugerirMatchIaApi
): ResultadoMatchIa {
  const data = dado.aiMetadata?.generatedAt
    ? new Date(dado.aiMetadata.generatedAt)
    : null;

  return {
    sugestoes: dado.sugestoes.map(converterSugestaoIa),
    modelo: dado.aiMetadata?.modeloVersao ?? '',
    confianca: dado.aiMetadata?.grauConfianca ?? 0,
    humanInTheLoop: dado.aiMetadata?.humanInTheLoop ?? true,
    geradoEm:
      data && !Number.isNaN(data.getTime())
        ? data.toLocaleString('pt-BR')
        : '',
  };
}
// #endregion
