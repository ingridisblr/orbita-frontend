import { useEffect, useState, type ComponentProps } from 'react';
import { listarDesafios } from '../services/desafioService';
import { listarTodasIdeias } from '../services/ideiaService';
import { listarTodosMatches } from '../services/matchService';
import { listarProjetos } from '../services/projetoService';
import { listarTriagens } from '../services/triagemService';
import { formatarData } from '../utils/matchFormatters';
import { PainelAvaliacao } from './PainelAvaliacao';

export function PainelAvaliacaoIntegrado() {
  const [dados, setDados] = useState<ComponentProps<typeof PainelAvaliacao>>({ carregando: true });

  useEffect(() => {
    let ativo = true;
    Promise.allSettled([listarDesafios(), listarTodasIdeias(), listarTodosMatches(), listarTriagens(), listarProjetos()] as const)
      .then(([desafiosApi, ideiasApi, matchesApi, triagensApi, projetosApi]) => {
        if (!ativo) return;

        const desafios = desafiosApi.status === 'fulfilled' ? desafiosApi.value : undefined;
        const ideias = ideiasApi.status === 'fulfilled' ? ideiasApi.value : undefined;
        const matches = matchesApi.status === 'fulfilled' ? matchesApi.value : undefined;
        const triagens = triagensApi.status === 'fulfilled' ? triagensApi.value : undefined;
        const projetos = projetosApi.status === 'fulfilled' ? projetosApi.value : undefined;
        const fontes = [
          ['desafios', desafios], ['ideias', ideias], ['matches', matches], ['triagens', triagens], ['projetos', projetos],
        ] as const;
        const falhas = fontes.filter(([, dados]) => dados === undefined).map(([nome]) => nome);
        const validados = matches?.filter((item) => item.status_match === 'VALIDADO');
        const avaliados = new Set(triagens?.map((item) => item.id_match));
        const porIdeia = new Map(ideias?.map((item) => [item.id, item]));
        const pendentes = ideias && triagens && validados?.filter((item) => {
          const ideia = porIdeia.get(String(item.id_ideia));
          return ideia && ideia.status.toLowerCase() !== 'arquivada' && !avaliados.has(item.id_match);
        });

        setDados({
          aviso: falhas.length ? `Dados indisponíveis para: ${falhas.join(', ')}.` : undefined,
          indicadores: {
            matchPendente: matches?.filter((item) => item.status_match === 'PENDENTE').length,
            triagemPendente: pendentes ? new Set(pendentes.map((item) => item.id_ideia)).size : undefined,
            projetosAtivos: projetos?.filter((item) => item.status_kanban !== 'Concluído').length,
          },
          fluxo: {
            desafiosCadastrados: desafios?.length,
            comIdeiasVinculadas: contarDistintos(ideias?.map((item) => item.desafioId).filter(Boolean)),
            aposMatchConfirmado: contarDistintos(validados?.map((item) => item.id_desafio)),
            emTriagem: contarDistintos(ideias?.filter((item) => ['em_avaliacao', 'em avaliação'].includes(item.status.toLowerCase())).map((item) => item.desafioId).filter(Boolean)),
            aprovadosParaProjeto: contarDistintos(ideias?.filter((item) => item.status.toLowerCase() === 'aprovada').map((item) => item.desafioId).filter(Boolean)),
            concluidos: contarDistintos(projetos?.filter((item) => item.status_kanban === 'Concluído').map((item) => item.id_desafio).filter((id) => id !== null)),
          },
          atividades: triagens?.sort((a, b) => b.data_avaliacao.localeCompare(a.data_avaliacao)).slice(0, 5).map((item) => ({
            id: String(item.id_triagem),
            acao: 'Triagem registrada',
            referencia: porIdeia.get(String(item.id_ideia))?.titulo ?? `Ideia #${item.id_ideia}`,
            descricao: item.parecer,
            periodo: formatarData(item.data_avaliacao),
          })),
        });
      })
      .catch((error: unknown) => {
        if (ativo) setDados({ erro: error instanceof Error ? error.message : 'Não foi possível carregar o painel.' });
      });
    return () => { ativo = false; };
  }, []);

  return <PainelAvaliacao {...dados} />;
}

function contarDistintos(ids?: (string | number)[]) {
  return ids ? new Set(ids).size : undefined;
}
