import { useEffect, useState } from 'react';
import { aprovarIdeia, listarTodasIdeias } from '../services/ideiaService';
import { listarTodosMatches, obterMatch } from '../services/matchService';
import { listarTriagens, registrarTriagem, type DecisaoApi } from '../services/triagemService';
import { Triagem, type AvaliacaoTriagem, type DecisaoTriagem, type IdeiaTriagem } from './Triagem';

const decisoes: Record<DecisaoTriagem, DecisaoApi> = {
  devolver: 'ajustes',
  rejeitar: 'reprovada',
  aprovar: 'aprovada',
};
const statusAprovaveis = new Set(['submetida', 'nova', 'em_avaliacao', 'em avaliação']);

export function TriagemIntegrada() {
  const [fila, setFila] = useState<IdeiaTriagem[]>();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [revisao, setRevisao] = useState(0);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarTodosMatches(), listarTodasIdeias(), listarTriagens()])
      .then(([matches, ideias, triagens]) => {
        if (!ativo) return;
        const porId = new Map(ideias.map((ideia) => [ideia.id, ideia]));
        const triagensAprovadas = new Set(triagens.filter((item) => item.decisao === 'aprovada').map((item) => item.id_match));
        setFila(matches.flatMap((match) => {
          const ideia = porId.get(String(match.id_ideia));
          if (match.status_match !== 'VALIDADO' || !ideia || ideia.status.toLowerCase() === 'arquivada') return [];
          return [{
            ...ideia,
            id: String(match.id_match),
            desafio: match.desafio_titulo ?? ideia.desafio,
            area: ideia.areaOrigem,
            podeAprovar: triagensAprovadas.has(match.id_match) &&
              statusAprovaveis.has(ideia.status.trim().toLowerCase().replace(/-/g, '_')),
          }];
        }));
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar a triagem.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [revisao]);

  function atualizar() {
    setCarregando(true);
    setErro('');
    setRevisao((valor) => valor + 1);
  }

  async function decidir({ ideiaId, notas, justificativa }: AvaliacaoTriagem, decisao: DecisaoTriagem) {
    const { impacto, urgencia, viabilidade, alinhamento, esforco } = notas;
    if (!impacto || !urgencia || !viabilidade || !alinhamento || !esforco) {
      throw new Error('Preencha as cinco notas da triagem.');
    }
    await registrarTriagem({
      id_match: Number(ideiaId), impacto, urgencia, viabilidade, alinhamento, esforco,
      parecer: justificativa.trim(), decisao: decisoes[decisao],
    });
    atualizar();
  }

  async function aprovar(idMatch: string) {
    const match = await obterMatch(Number(idMatch));
    await aprovarIdeia(String(match.id_ideia));
    atualizar();
  }

  return (
    <>
      {erro && <button type="button" onClick={atualizar}>Recarregar fila</button>}
      <Triagem ideias={fila} carregando={carregando} erro={erro} onDecidir={decidir} onAprovarIdeia={aprovar} />
    </>
  );
}
