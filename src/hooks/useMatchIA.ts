/* #region Importações */
import { useCallback, useRef, useState } from 'react';

import { revisarMatch, sugerirMatchesIa } from '../services/matchIaService';

import type { DecisaoMatch, ResultadoMatchIa } from '../types/matchIa';
/* #endregion */

/* #region Hook */
export function useMatchIA() {

  /* #region Estados */
  const [resultado, setResultado] = useState<ResultadoMatchIa | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [revisando, setRevisando] = useState<string | null>(null);
  const [errosRevisao, setErrosRevisao] = useState<Record<string, string>>({});
  /* #endregion */

  /* #region Controle de requisições */

  // Ignora respostas atrasadas de consultas substituídas ou canceladas.
  const requisicaoAtual = useRef(0);

  /* #endregion */

  /* #region Gerar sugestões da IA */
  const sugerir = useCallback(async (desafioId: string, topN?: number) => {
    const requisicao = ++requisicaoAtual.current;

    setCarregando(true);
    setErro('');
    setResultado(null);
    setErrosRevisao({});

    try {
      const dados = await sugerirMatchesIa(desafioId, topN);

      if (requisicao === requisicaoAtual.current) {
        setResultado(dados);
      }
    } catch (error: unknown) {
      if (requisicao === requisicaoAtual.current) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível gerar as sugestões da IA.'
        );
      }
    } finally {
      if (requisicao === requisicaoAtual.current) {
        setCarregando(false);
      }
    }
  }, []);
  /* #endregion */

  /* #region Revisar sugestão */
  const revisar = useCallback(
    async (
      matchId: string,
      decisao: DecisaoMatch,
      justificativa?: string
    ) => {
      setRevisando(matchId);

      setErrosRevisao((atual) => ({
        ...atual,
        [matchId]: '',
      }));

      try {
        const novoStatus = await revisarMatch(
          matchId,
          decisao,
          justificativa
        );

        setResultado((atual) =>
          atual
            ? {
                ...atual,
                sugestoes: atual.sugestoes.map((sugestao) =>
                  sugestao.matchId === matchId
                    ? { ...sugestao, status: novoStatus }
                    : sugestao
                ),
              }
            : atual
        );
      } catch (error: unknown) {
        setErrosRevisao((atual) => ({
          ...atual,
          [matchId]:
            error instanceof Error
              ? error.message
              : 'Não foi possível registrar a decisão.',
        }));
      } finally {
        setRevisando(null);
      }
    },
    []
  );
  /* #endregion */

  /* #region Limpar resultados */
  const limpar = useCallback(() => {
    requisicaoAtual.current++;

    setResultado(null);
    setErro('');
    setCarregando(false);
    setRevisando(null);
    setErrosRevisao({});
  }, []);
  /* #endregion */

  /* #region Retorno */
  return {
    resultado,
    carregando,
    erro,
    revisando,
    errosRevisao,
    sugerir,
    revisar,
    limpar,
  };
  /* #endregion */
}
/* #endregion */
