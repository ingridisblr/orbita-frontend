import './PainelAvaliacao.css';

export interface IndicadoresAvaliacao {
  matchPendente?: number;
  triagemPendente?: number;
  projetosAtivos?: number;
  mvpsEmValidacao?: number;
}

export interface FluxoAvaliacao {
  desafiosCadastrados?: number;
  comIdeiasVinculadas?: number;
  aposMatchConfirmado?: number;
  emTriagem?: number;
  aprovadosParaProjeto?: number;
  concluidos?: number;
}

export interface AtividadeAvaliacao {
  id: string;
  acao: string;
  referencia: string;
  descricao: string;
  periodo: string;
}

export interface PainelAvaliacaoProps {
  indicadores?: IndicadoresAvaliacao;
  fluxo?: FluxoAvaliacao;
  atividades?: readonly AtividadeAvaliacao[];
  carregando?: boolean;
  erro?: string;
  aviso?: string;
}

export function PainelAvaliacao({
  indicadores,
  fluxo,
  atividades,
  carregando = false,
  erro = '',
  aviso = '',
}: PainelAvaliacaoProps) {
  const cards = [
    {
      titulo: 'Match pendente',
      valor: indicadores?.matchPendente,
      descricao: 'Ideias aguardando correlação com desafios',
      tipo: 'match',
    },
    {
      titulo: 'Triagem pendente',
      valor: indicadores?.triagemPendente,
      descricao: 'Ideias aguardando avaliação por critérios',
      tipo: 'triagem',
    },
    {
      titulo: 'Projetos ativos',
      valor: indicadores?.projetosAtivos,
      descricao: 'Iniciativas em andamento no Kanban',
      tipo: 'projetos',
    },
    {
      titulo: 'MVPs em validação',
      valor: indicadores?.mvpsEmValidacao,
      descricao: 'Hipóteses sendo testadas em campo',
      tipo: 'mvp',
    },
  ];
  const etapas = fluxo
    ? [
        { titulo: 'Desafios cadastrados', valor: fluxo.desafiosCadastrados },
        { titulo: 'Com ideias vinculadas', valor: fluxo.comIdeiasVinculadas },
        { titulo: 'Após match confirmado', valor: fluxo.aposMatchConfirmado },
        { titulo: 'Em triagem/priorização', valor: fluxo.emTriagem },
        { titulo: 'Aprovados para projeto', valor: fluxo.aprovadosParaProjeto },
        { titulo: 'Concluídos', valor: fluxo.concluidos },
      ]
      .filter((etapa): etapa is { titulo: string; valor: number } => etapa.valor !== undefined)
    : [];

  const maiorValor = Math.max(1, ...etapas.map(({ valor }) => valor));
  const exibirDados = !carregando && !erro;

  return (
    <div className="painel-avaliacao" aria-busy={carregando}>
      <header className="painel-avaliacao__header">
        <h1>Painel de Avaliação</h1>
        <p>Visão consolidada das atividades do Hub de Inovação.</p>
      </header>

      {carregando && (
        <p className="painel-avaliacao__estado" role="status">
          Carregando indicadores...
        </p>
      )}

      {erro && (
        <p className="painel-avaliacao__estado painel-avaliacao__estado--erro" role="alert">
          {erro}
        </p>
      )}
      {aviso && (
        <p className="painel-avaliacao__estado painel-avaliacao__estado--erro" role="alert">{aviso}</p>
      )}

      {exibirDados && (
        <>
          <section
            className="painel-avaliacao__indicadores"
            aria-label="Indicadores de avaliação"
          >
            {cards.map(({ titulo, valor, descricao, tipo }) => (
              <article
                className={`painel-avaliacao__card painel-avaliacao__indicador painel-avaliacao__indicador--${tipo}`}
                key={titulo}
              >
                <h2>{titulo}</h2>
                <strong className="painel-avaliacao__valor">
                  {valor ?? (
                    <span aria-label="Dado indisponível">—</span>
                  )}
                </strong>
                <p>{descricao}</p>
              </article>
            ))}
          </section>
          <div className="painel-avaliacao__detalhes">
            <section className="painel-avaliacao__card painel-avaliacao__detalhe" aria-labelledby="painel-fluxo">
              <div className="painel-avaliacao__secao-header">
                <h2 id="painel-fluxo">Fluxo do Processo</h2>
                <p>Acompanhamento do funil de inovação</p>
              </div>

              {etapas.length ? (
                <ul className="painel-avaliacao__fluxo">
                  {etapas.map(({ titulo, valor }) => (
                    <li key={titulo}>
                      <span>{titulo}</span>
                      <div className="painel-avaliacao__medicao">
                        <div className="painel-avaliacao__trilho" aria-hidden="true">
                          <div
                            className="painel-avaliacao__barra"
                            style={{ width: `${Math.max(0, valor / maiorValor) * 100}%` }}
                          />
                        </div>
                        <strong>{valor}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="painel-avaliacao__estado">Fluxo indisponível.</p>
              )}
            </section>

            <section className="painel-avaliacao__card painel-avaliacao__detalhe" aria-labelledby="painel-atividades">
              <div className="painel-avaliacao__secao-header">
                <h2 id="painel-atividades">Atividades Recentes</h2>
              </div>

              {atividades?.length ? (
                <ul className="painel-avaliacao__atividades">
                  {atividades.map((atividade) => (
                    <li key={atividade.id}>
                      <span className="painel-avaliacao__selo">{atividade.acao}</span>
                      <div>
                        <strong>{atividade.referencia}</strong>
                        <p>{atividade.descricao}</p>
                      </div>
                      <span className="painel-avaliacao__periodo">{atividade.periodo}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="painel-avaliacao__estado">
                  {atividades ? 'Nenhuma atividade recente.' : 'Atividades indisponíveis.'}
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
