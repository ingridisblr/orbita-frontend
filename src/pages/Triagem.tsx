import { useState } from 'react';
import './Triagem.css';

const criterios = [
  { id: 'impacto', titulo: 'Impacto' },
  { id: 'urgencia', titulo: 'Urgência' },
  { id: 'viabilidade', titulo: 'Viabilidade' },
  { id: 'alinhamento', titulo: 'Alinhamento estratégico' },
  { id: 'esforco', titulo: 'Esforço necessário' },
] as const;

const notas = [1, 2, 3, 4, 5] as const;

type Criterio = (typeof criterios)[number]['id'];
type Nota = (typeof notas)[number];
export type DecisaoTriagem = 'devolver' | 'rejeitar' | 'aprovar';

export interface IdeiaTriagem {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  desafio?: string;
  categoria?: string;
  autor?: string;
  area?: string;
}

export interface AvaliacaoTriagem {
  ideiaId: string;
  notas: Partial<Record<Criterio, Nota>>;
  justificativa: string;
}

export interface TriagemProps {
  ideias?: readonly IdeiaTriagem[];
  carregando?: boolean;
  erro?: string;
  onDecidir?: (avaliacao: AvaliacaoTriagem, decisao: DecisaoTriagem) => Promise<void> | void;
  onSolicitarApoio?: (avaliacao: AvaliacaoTriagem) => Promise<string>;
}

const rascunhoVazio: Omit<AvaliacaoTriagem, 'ideiaId'> = { notas: {}, justificativa: '' };

export function Triagem({
  ideias,
  carregando = false,
  erro = '',
  onDecidir,
  onSolicitarApoio,
}: TriagemProps) {
  const [ideiaSelecionadaId, setIdeiaSelecionadaId] = useState('');
  const [rascunhos, setRascunhos] = useState<Record<string, Omit<AvaliacaoTriagem, 'ideiaId'>>>({});
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const ideiaSelecionada = ideias?.find((ideia) => ideia.id === ideiaSelecionadaId) ?? ideias?.[0];
  const rascunho = ideiaSelecionada ? rascunhos[ideiaSelecionada.id] ?? rascunhoVazio : rascunhoVazio;
  const avaliacaoBloqueada = !ideiaSelecionada || carregando || Boolean(erro) || processando;
  const pontuacao = criterios.reduce((total, criterio) => total + (rascunho.notas[criterio.id] ?? 0), 0);

  function atualizarRascunho(ideiaId: string, dados: Partial<Omit<AvaliacaoTriagem, 'ideiaId'>>) {
    setRascunhos((anteriores) => ({
      ...anteriores,
      [ideiaId]: { ...(anteriores[ideiaId] ?? rascunhoVazio), ...dados },
    }));
    setMensagem('');
    setErroAcao('');
  }

  function selecionarIdeia(id: string) {
    setIdeiaSelecionadaId(id);
    setMensagem('');
    setErroAcao('');
  }

  async function decidir(decisao: DecisaoTriagem) {
    if (!ideiaSelecionada || !onDecidir || avaliacaoBloqueada) return;

    const avaliacao = { ideiaId: ideiaSelecionada.id, ...rascunho };

    setProcessando(true);
    setMensagem('');
    setErroAcao('');

    try {
      await onDecidir(avaliacao, decisao);
      setMensagem('Decisão registrada com sucesso.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível registrar a decisão.');
    } finally {
      setProcessando(false);
    }
  }

  async function solicitarApoio() {
    if (!ideiaSelecionada || !onSolicitarApoio || avaliacaoBloqueada) return;

    const avaliacao = { ideiaId: ideiaSelecionada.id, ...rascunho };

    setProcessando(true);
    setMensagem('');
    setErroAcao('');

    try {
      const sugestao = await onSolicitarApoio(avaliacao);
      atualizarRascunho(avaliacao.ideiaId, { justificativa: sugestao });
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível solicitar o apoio da IA.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="triagem-page" aria-busy={carregando || processando}>
      <header className="triagem-page__header">
        <h1>Triagem / Priorização</h1>
        <p>Avaliação por critérios e decisão sobre encaminhamento.</p>
      </header>

      {carregando && <p className="triagem-page__estado" role="status">Carregando ideias...</p>}
      {erro && <p className="triagem-page__estado triagem-page__erro" role="alert">{erro}</p>}

      <div className="triagem-page__layout">
        <div className="triagem-page__principal">
          {ideiaSelecionada ? (
              <article className="triagem-page__card triagem-page__ideia">
                <div className="triagem-page__identificacao">
                  <span>{ideiaSelecionada.codigo}</span>
                  <span className="triagem-page__status">{ideiaSelecionada.status}</span>
                  {ideiaSelecionada.desafio && <span>{ideiaSelecionada.desafio}</span>}
                </div>
                <h2>{ideiaSelecionada.titulo}</h2>
                <p>{ideiaSelecionada.descricao}</p>
                <div className="triagem-page__tags">
                  {[ideiaSelecionada.categoria, ideiaSelecionada.autor, ideiaSelecionada.area].filter(Boolean).map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>
              </article>
          ) : (
            <section className="triagem-page__card">
              <h2>Avaliação da ideia</h2>
              <p className="triagem-page__estado">
                {carregando
                  ? 'Aguardando carregamento da fila.'
                  : ideias
                    ? 'Nenhuma ideia na fila de triagem.'
                    : 'Selecione uma ideia quando a fila estiver disponível.'}
              </p>
            </section>
          )}

          <section className="triagem-page__card" aria-labelledby="triagem-criterios">
            <div className="triagem-page__card-header">
              <h2 id="triagem-criterios">Critérios de Avaliação</h2>
              <strong className="triagem-page__total">{pontuacao}/25 pts</strong>
            </div>
            <progress className="triagem-page__progresso" value={pontuacao} max={25} aria-label="Pontuação total" />

            <div className="triagem-page__criterios">
              {criterios.map(({ id, titulo }) => (
                <fieldset key={id} className="triagem-page__criterio" disabled={avaliacaoBloqueada}>
                  <legend>{titulo}</legend>
                  <div className="triagem-page__notas">
                    {notas.map((nota) => (
                      <label key={nota} className="triagem-page__nota">
                        <input
                          type="radio"
                          name={`triagem-${id}`}
                          value={nota}
                          checked={rascunho.notas[id] === nota}
                          onChange={() => ideiaSelecionada && atualizarRascunho(ideiaSelecionada.id, {
                            notas: { ...rascunho.notas, [id]: nota },
                          })}
                        />
                        <span>{nota}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="triagem-page__card" aria-labelledby="triagem-parecer">
            <div className="triagem-page__card-header">
              <h2 id="triagem-parecer">Justificativa e Parecer</h2>
              <button type="button" className="triagem-page__btn triagem-page__btn--secundario" disabled={!onSolicitarApoio || avaliacaoBloqueada} onClick={solicitarApoio}>
                Apoio da IA
              </button>
            </div>
            <textarea
              aria-labelledby="triagem-parecer"
              placeholder="Registre os critérios considerados, pontos de atenção e recomendação fundamentada..."
              value={rascunho.justificativa}
              onChange={(event) => ideiaSelecionada && atualizarRascunho(ideiaSelecionada.id, { justificativa: event.target.value })}
              disabled={avaliacaoBloqueada}
              rows={5}
            />
          </section>

          <div className="triagem-page__acoes">
            <button type="button" className="triagem-page__btn triagem-page__btn--secundario" disabled={!onDecidir || avaliacaoBloqueada} onClick={() => decidir('devolver')}>Devolver ao autor</button>
            <button type="button" className="triagem-page__btn triagem-page__btn--rejeitar" disabled={!onDecidir || avaliacaoBloqueada} onClick={() => decidir('rejeitar')}>Rejeitar</button>
            <button type="button" className="triagem-page__btn triagem-page__btn--primario" disabled={!onDecidir || avaliacaoBloqueada} onClick={() => decidir('aprovar')}>Aprovar para Projeto</button>
          </div>

          {mensagem && <p className="triagem-page__estado triagem-page__sucesso" role="status">{mensagem}</p>}
          {erroAcao && <p className="triagem-page__estado triagem-page__erro" role="alert">{erroAcao}</p>}

        </div>

        <aside className="triagem-page__lateral" aria-label="Fila e pontuação">
          <section className="triagem-page__card" aria-labelledby="triagem-fila">
            <h2 id="triagem-fila">Fila de Triagem</h2>
            {ideias?.length ? (
              <ul className="triagem-page__fila">
                {ideias.map((ideia) => (
                  <li key={ideia.id}>
                    <button
                      type="button"
                      className="triagem-page__fila-item"
                      aria-pressed={ideia.id === ideiaSelecionada?.id}
                      onClick={() => selecionarIdeia(ideia.id)}
                      disabled={processando || carregando || Boolean(erro)}
                    >
                      <span>{ideia.codigo}</span>
                      <strong>{ideia.titulo}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="triagem-page__estado">{ideias ? 'Fila vazia.' : 'Nenhuma informação disponível.'}</p>}
          </section>

          <section className="triagem-page__card" aria-labelledby="triagem-pontuacao">
            <h2 id="triagem-pontuacao">Pontuação Atual</h2>
            <dl className="triagem-page__resumo">
              {criterios.map(({ id, titulo }) => (
                <div key={id}>
                  <dt>{titulo}</dt>
                  <dd>{rascunho.notas[id] ?? 0}/5</dd>
                </div>
              ))}
              <div className="triagem-page__resumo-total">
                <dt>Total</dt>
                <dd aria-live="polite">{pontuacao}/25</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
