import { useEffect, useState } from 'react';
import { listarDesafios } from '../services/desafioService';
import { listarTodasIdeias } from '../services/ideiaService';
import { listarTodosMatches } from '../services/matchService';
import { etapasProjeto, listarProjetos, type ProjetoApi } from '../services/projetoService';
import type { User } from '../types/auth';
import type { Desafio } from '../types/desafio';
import type { Ideia } from '../types/ideia';
import type { Match } from '../types/match';
import './Dashboard.css';

interface DashboardProps {
  user: User;
}

interface ItemGrafico {
  titulo: string;
  valor: number | null;
}

interface DadosDashboard {
  desafios: Desafio[] | null;
  ideias: Ideia[] | null;
  matches: Match[] | null;
  projetos: ProjetoApi[] | null;
}

const dadosIniciais: DadosDashboard = {
  desafios: null,
  ideias: null,
  matches: null,
  projetos: null,
};

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
}

function agruparRegistros<T>(registros: T[] | null, obterGrupo: (registro: T) => string): ItemGrafico[] {
  if (!registros) return [];

  const grupos = new Map<string, ItemGrafico>();

  for (const registro of registros) {
    const titulo = obterGrupo(registro).trim() || 'Não informado';
    const chave = normalizar(titulo);
    const grupo = grupos.get(chave);

    if (grupo) {
      grupo.valor = (grupo.valor ?? 0) + 1;
    } else {
      grupos.set(chave, { titulo, valor: 1 });
    }
  }

  return [...grupos.values()].sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));
}

function GraficoBarras({ itens, vazio }: { itens: ItemGrafico[]; vazio: string }) {
  if (!itens.length) {
    return <p className="dashboard-page__vazio">{vazio}</p>;
  }

  const maior = Math.max(1, ...itens.map((item) => item.valor ?? 0));

  return (
    <ul className="dashboard-page__barras">
      {itens.map(({ titulo, valor }) => (
        <li key={titulo}>
          <span>{titulo}</span>
          <div className="dashboard-page__barra-trilho" aria-hidden="true">
            <div
              className="dashboard-page__barra"
              style={{ width: `${((valor ?? 0) / maior) * 100}%` }}
            />
          </div>
          <strong>{valor ?? '—'}</strong>
        </li>
      ))}
    </ul>
  );
}

export function Dashboard({ user }: DashboardProps) {
  const [dados, setDados] = useState<DadosDashboard>(dadosIniciais);
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<string[]>([]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [desafios, ideias, matches, projetos] = await Promise.allSettled([
        listarDesafios(),
        listarTodasIdeias(),
        user.role === 'analista' ? listarTodosMatches() : Promise.resolve(null),
        listarProjetos(),
      ] as const);

      if (!ativo) return;

      setDados({
        desafios: desafios.status === 'fulfilled'
          ? desafios.value.filter((item) => user.role !== 'gestor' || item.responsavelId === user.id)
          : null,
        ideias: ideias.status === 'fulfilled' ? ideias.value : null,
        matches: matches.status === 'fulfilled' ? matches.value : null,
        projetos: projetos.status === 'fulfilled' ? projetos.value : null,
      });

      const falhas = [
        { nome: 'desafios', resultado: desafios },
        { nome: 'ideias', resultado: ideias },
        { nome: 'vínculos Match', resultado: matches },
        { nome: 'projetos', resultado: projetos },
      ].filter(({ resultado }) => resultado.status === 'rejected');

      setErros(falhas.map(({ nome }) => nome));
      setCarregando(false);
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [user.id, user.role]);

  const { desafios, ideias, matches, projetos } = dados;
  const ideiasEmTriagem = ideias?.filter((ideia) => ['em triagem', 'em avaliacao'].includes(normalizar(ideia.status)));
  const desafiosAtivos = desafios?.filter((desafio) => ['ativo', 'aberto'].includes(normalizar(desafio.status))).length;
  const idsDesafios = desafios ? new Set(desafios.map((desafio) => desafio.id)) : null;

  function contarDesafiosVinculados(registros: string[] | null): number | null {
    if (!idsDesafios || !registros) return null;
    return new Set(registros.filter((id) => idsDesafios.has(id))).size;
  }

  const indicadores = [
    { titulo: 'Desafios ativos', valor: desafiosAtivos ?? null, descricao: 'Abertos ou ativos', tipo: 'desafios' },
    { titulo: 'Ideias registradas', valor: ideias?.length ?? null, descricao: 'Ideias visíveis ao perfil', tipo: 'ideias' },
    { titulo: 'Em triagem', valor: ideiasEmTriagem?.length ?? null, descricao: 'Aguardando avaliação', tipo: 'triagem' },
    { titulo: 'Projetos em andamento', valor: projetos?.filter((item) => item.status_kanban !== 'Concluído').length ?? null, descricao: 'Projetos visíveis ao perfil', tipo: 'projetos' },
  ];

  const statusDesafios = agruparRegistros(desafios, (desafio) =>
    normalizar(desafio.status) === 'ativo' ? 'Aberto' : desafio.status,
  );
  const categoriasIdeias = agruparRegistros(ideias, (ideia) => ideia.categoria);

  const funil: ItemGrafico[] = [
    { titulo: 'Desafios', valor: idsDesafios?.size ?? null },
    { titulo: 'Ideias vinculadas', valor: contarDesafiosVinculados(ideias?.map((ideia) => ideia.desafioId) ?? null) },
    { titulo: 'Após Match', valor: contarDesafiosVinculados(matches?.filter((match) => normalizar(match.status_match) === 'validado').map((match) => String(match.id_desafio)) ?? null) },
    { titulo: 'Em triagem', valor: contarDesafiosVinculados(ideiasEmTriagem?.map((ideia) => ideia.desafioId) ?? null) },
    { titulo: 'Aprovados', valor: contarDesafiosVinculados(ideias?.filter((ideia) => normalizar(ideia.status) === 'aprovada').map((ideia) => ideia.desafioId) ?? null) },
    { titulo: 'Concluídos', valor: contarDesafiosVinculados(projetos?.flatMap((item) => item.status_kanban === 'Concluído' && item.id_desafio !== null ? [String(item.id_desafio)] : []) ?? null) },
  ];

  return (
    <div className="dashboard-page" aria-busy={carregando}>
      <header className="dashboard-page__header">
        <h1>Dashboard</h1>
        <p>Indicadores consolidados do sistema ÓRBITA.</p>
      </header>

      {carregando && <p className="dashboard-page__estado" role="status">Carregando indicadores...</p>}
      {!carregando && erros.length > 0 && (
        <p className="dashboard-page__estado dashboard-page__erro" role="alert">
          Não foi possível carregar: {erros.join(', ')}.
        </p>
      )}

      <section className="dashboard-page__indicadores" aria-label="Indicadores gerais">
        {indicadores.map(({ titulo, valor, descricao, tipo }) => (
          <article className={`dashboard-page__card dashboard-page__indicador dashboard-page__indicador--${tipo}`} key={tipo}>
            <h2>{titulo}</h2>
            <strong>{valor ?? '—'}</strong>
            <p>{descricao}</p>
          </article>
        ))}
      </section>

      <div className="dashboard-page__graficos">
        <section className="dashboard-page__card" aria-labelledby="dashboard-status">
          <header className="dashboard-page__card-header">
            <h2 id="dashboard-status">Status dos Desafios</h2>
          </header>
          <GraficoBarras itens={statusDesafios} vazio={desafios ? 'Nenhum desafio cadastrado.' : 'Dados dos desafios indisponíveis.'} />
        </section>

        <section className="dashboard-page__card dashboard-page__categorias" aria-labelledby="dashboard-categorias">
          <header className="dashboard-page__card-header">
            <h2 id="dashboard-categorias">Ideias por Categoria</h2>
          </header>
          <GraficoBarras itens={categoriasIdeias} vazio={ideias ? 'Nenhuma ideia cadastrada.' : 'Dados das ideias indisponíveis.'} />
        </section>

        <section className="dashboard-page__card" aria-labelledby="dashboard-projetos">
          <header className="dashboard-page__card-header">
            <h2 id="dashboard-projetos">Projetos por Status</h2>
            <p>Projetos visíveis ao perfil.</p>
          </header>
          <div className="dashboard-page__projetos">
            {etapasProjeto.map((etapa) => (
              <div key={etapa}>
                <strong>{projetos?.filter((item) => item.status_kanban === etapa).length ?? '—'}</strong>
                <span>{etapa}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-page__card" aria-labelledby="dashboard-funil">
          <header className="dashboard-page__card-header">
            <h2 id="dashboard-funil">Funil de Inovação</h2>
            <p>Quantidade de desafios identificados em cada etapa nos dados disponíveis.</p>
          </header>
          <GraficoBarras itens={funil} vazio="Dados do funil indisponíveis." />
        </section>
      </div>
    </div>
  );
}
