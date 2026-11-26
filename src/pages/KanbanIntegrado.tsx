import { useEffect, useState } from 'react';
import { listarTodasIdeias } from '../services/ideiaService';
import { listarTodosMatches } from '../services/matchService';
import { atualizarProjeto, consultarProjeto, criarProjeto, listarProjetos, moverProjeto, type EtapaProjeto, type ProjetoApi } from '../services/projetoService';
import { listarTriagens } from '../services/triagemService';
import { ProjetosKanban, type NovoProjetoKanban, type StatusProjetoKanban } from './ProjetosKanban';

const etapas: Record<StatusProjetoKanban, EtapaProjeto> = {
  aprovado: 'Aprovado',
  planejamento: 'Planejamento',
  desenvolvimento: 'Em Desenvolvimento',
  teste: 'Em Teste',
  concluido: 'Concluído',
};

export function KanbanIntegrado() {
  const [projetos, setProjetos] = useState<ProjetoApi[]>();
  const [origens, setOrigens] = useState<{ id: number; titulo: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroOrigens, setErroOrigens] = useState(false);

  useEffect(() => {
    let ativo = true;
    const consultaProjetos = listarProjetos();
    consultaProjetos
      .then((dados) => { if (ativo) setProjetos(dados); })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar os projetos.');
      })
      .finally(() => { if (ativo) setCarregando(false); });

    Promise.all([consultaProjetos, listarTodosMatches(), listarTodasIdeias(), listarTriagens()])
      .then(([existentes, matches, ideias, triagens]) => {
        if (!ativo) return;
        const convertidos = new Set(existentes.map((item) => item.id_match));
        const aprovados = new Map(ideias.filter((item) => item.status.toLowerCase() === 'aprovada').map((item) => [item.id, item]));
        const triados = new Set(triagens.filter((item) => item.decisao === 'aprovada').map((item) => item.id_match));
        setOrigens(matches.flatMap((match) => {
          const ideia = aprovados.get(String(match.id_ideia));
          if (!ideia || match.status_match !== 'VALIDADO' || !triados.has(match.id_match) || convertidos.has(match.id_match)) return [];
          return [{ id: match.id_match, titulo: `${ideia.titulo} — ${match.desafio_titulo ?? `Desafio #${match.id_desafio}`}` }];
        }));
      })
      .catch(() => { if (ativo) setErroOrigens(true); });
    return () => { ativo = false; };
  }, []);

  async function criar({ matchId, titulo, prazo }: NovoProjetoKanban) {
    const novo = await criarProjeto({
      id_match: Number(matchId),
      ...(titulo && { titulo }),
      ...(prazo && { data_prazo: prazo }),
    });
    setProjetos((atuais) => [novo, ...(atuais ?? [])]);
    setOrigens((atuais) => atuais.filter((item) => item.id !== novo.id_match));
  }

  async function mover(id: string, status: StatusProjetoKanban) {
    const atualizado = await moverProjeto(id, etapas[status]);
    setProjetos((atuais) => atuais?.map((item) => item.id_projeto === atualizado.id_projeto ? atualizado : item));
  }

  return (
    <ProjetosKanban
      projetos={projetos?.flatMap((item) => {
        const status = (Object.keys(etapas) as StatusProjetoKanban[]).find((chave) => etapas[chave] === item.status_kanban);
        return status ? [{
          id: String(item.id_projeto), codigo: `Projeto #${item.id_projeto}`, titulo: item.titulo,
          responsavel: item.responsavel_nome ?? undefined, status,
        }] : [];
      })}
      origens={origens}
      carregando={carregando}
      erro={erro}
      avisoOrigens={erroOrigens ? 'Não foi possível consultar os vínculos elegíveis para novos projetos.' : undefined}
      onCriarProjeto={criar}
      onMoverProjeto={mover}
      onConsultarProjeto={consultarProjeto}
      onAtualizarProjeto={async (id, dados) => {
        const atualizado = await atualizarProjeto(id, dados);
        setProjetos((atuais) => atuais?.map((item) => item.id_projeto === atualizado.id_projeto ? atualizado : item));
        return atualizado;
      }}
    />
  );
}
