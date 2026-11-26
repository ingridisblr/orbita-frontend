/* #region Importações */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api';
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

  // Segundos de espera depois de falha temporária (limite de requisições
  // ou rede). Evita cliques repetidos que pioram o bloqueio.
  const [segundosEspera, setSegundosEspera] = useState(0);
  /* #endregion */

  /* #region Controle de requisições */

  // Ignora respostas atrasadas de consultas substituídas ou canceladas.
  const requisicaoAtual = useRef(0);

  // Impede duas consultas simultâneas, mesmo com clique duplo rápido.
  const emAndamento = useRef(false);

  /* #endregion */

  /* #region Contagem regressiva */
  useEffect(() => {
    if (segundosEspera <= 0) return;

    const timer = setTimeout(() => {
      setSegundosEspera((atual) => Math.max(0, atual - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [segundosEspera]);
  /* #endregion */

  /* #region Gerar sugestões da IA */
  // Retorna true só quando a IA respondeu. Quem chama usa isso para não
  // recarregar a tela (mais requisições) depois de uma falha.
  const sugerir = useCallback(
    async (desafioId: string, topN?: number): Promise<boolean> => {
      if (emAndamento.current) return false;
      emAndamento.current = true;

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

        return true;
      } catch (error: unknown) {
        if (requisicao === requisicaoAtual.current) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível gerar as sugestões da IA.'
          );

          if (error instanceof ApiError && error.ehTemporario) {
            const sugerido = error.retryAfterMs
              ? Math.ceil(error.retryAfterMs / 1000)
              : 0;

            setSegundosEspera(Math.min(Math.max(sugerido, 15), 60));
          }
        }

        return false;
      } finally {
        // Só a consulta vigente libera a trava e o botão. Uma consulta
        // antiga (cancelada por limpar) não pode soltar a trava de outra.
        if (requisicao === requisicaoAtual.current) {
          emAndamento.current = false;
          setCarregando(false);
        }
      }
    },
    []
  );
  /* #endregion */

  /* #region Revisar sugestão */
  const revisar = useCallback(
    async (
      matchId: string,
      decisao: DecisaoMatch,
      justificativa?: string
    ): Promise<boolean> => {
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

        return true;
      } catch (error: unknown) {
        setErrosRevisao((atual) => ({
          ...atual,
          [matchId]:
            error instanceof Error
              ? error.message
              : 'Não foi possível registrar a decisão.',
        }));

        return false;
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
    emAndamento.current = false;

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
    segundosEspera,
    revisando,
    errosRevisao,
    sugerir,
    revisar,
    limpar,
  };
  /* #endregion */
}
/* #endregion */
