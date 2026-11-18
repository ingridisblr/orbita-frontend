import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { listarTodasIdeias } from '../services/ideiaService';
import {
  criarMatch,
  listarDesafiosParaMatch,
  listarTodosMatches,
} from '../services/matchService';
import type { User } from '../types/auth';
import type { Desafio } from '../types/desafio';
import type { Ideia } from '../types/ideia';
import type { Match as MatchVinculo } from '../types/match';
import {
  classeStatusMatch,
  codigoDesafio,
  descreverErro,
  formatarData,
  rotuloOrigemMatch,
  rotuloStatusDesafio,
  rotuloStatusIdeia,
  rotuloStatusMatch,
} from '../utils/matchFormatters';
import './Match.css';

interface MatchProps {
  user: User;
}

const TODOS = 'todos';

type Aba = 'ideias' | 'desafios';
const LIMITE_JUSTIFICATIVA = 5000;

function chaveDoPar(idIdeia: number, idDesafio: number): string {
  return `${idIdeia}:${idDesafio}`;
}

function ideiaArquivada(ideia: Ideia): boolean {
  return ideia.status.trim().toLowerCase() === 'arquivada';
}

export const Match: React.FC<MatchProps> = ({ user }) => {
  // Dados vindos da API
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [matches, setMatches] = useState<MatchVinculo[]>([]);

  // Estados da carga inicial
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [tentativa, setTentativa] = useState(0);

  // Formulário de novo vínculo
  const [idIdeia, setIdIdeia] = useState('');
  const [idDesafio, setIdDesafio] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Filtro da lista de vínculos
  const [filtroDesafio, setFiltroDesafio] = useState(TODOS);

  // Listagem de ideias e desafios
  const [aba, setAba] = useState<Aba>('ideias');
  const [busca, setBusca] = useState('');
  const secaoFormRef = useRef<HTMLElement>(null);
  const enviandoRef = useRef(false); // trava síncrona contra clique duplo

  const ehAnalista = user.role === 'analista';

  // Carga inicial: ideias, desafios e vínculos existentes
  useEffect(() => {
    if (!ehAnalista) return;

    let cancelado = false;

    Promise.all([
      listarTodasIdeias(),
      listarDesafiosParaMatch(),
      listarTodosMatches(),
    ])
      .then(([listaIdeias, listaDesafios, listaMatches]) => {
        if (cancelado) return;
        setIdeias(listaIdeias);
        setDesafios(listaDesafios);
        setMatches(listaMatches);
        setErroCarga('');
      })
      .catch((e: unknown) => {
        if (!cancelado) setErroCarga(descreverErro(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [ehAnalista, tentativa]);

  function tentarNovamente() {
    setCarregando(true);
    setErroCarga('');
    setTentativa((n) => n + 1);
  }

  const paresExistentes = useMemo(
    () => new Set(matches.map((m) => chaveDoPar(m.id_ideia, m.id_desafio))),
    [matches]
  );

  // Ideias arquivadas não entram em match (o backend também recusa)
  const ideiasDisponiveis = useMemo(
    () => ideias.filter((ideia) => !ideiaArquivada(ideia)),
    [ideias]
  );

  const ideiaEscolhida = ideias.find((i) => i.id === idIdeia);

  const matchesFiltrados = useMemo(
    () =>
      filtroDesafio === TODOS
        ? matches
        : matches.filter((m) => String(m.id_desafio) === filtroDesafio),
    [matches, filtroDesafio]
  );

  // Quantos vínculos cada ideia e cada desafio já têm
  const vinculosPorIdeia = useMemo(() => {
    const contagem = new Map<number, number>();
    matches.forEach((m) =>
      contagem.set(m.id_ideia, (contagem.get(m.id_ideia) ?? 0) + 1)
    );
    return contagem;
  }, [matches]);

  const vinculosPorDesafio = useMemo(() => {
    const contagem = new Map<number, number>();
    matches.forEach((m) =>
      contagem.set(m.id_desafio, (contagem.get(m.id_desafio) ?? 0) + 1)
    );
    return contagem;
  }, [matches]);

  const termo = busca.trim().toLowerCase();

  const ideiasListadas = useMemo(
    () =>
      ideias.filter((i) =>
        termo === ''
          ? true
          : `${i.codigo} ${i.titulo} ${i.areaOrigem} ${i.categoria}`
              .toLowerCase()
              .includes(termo)
      ),
    [ideias, termo]
  );

  const desafiosListados = useMemo(
    () =>
      desafios.filter((d) =>
        termo === ''
          ? true
          : `${codigoDesafio(d.id)} ${d.titulo} ${d.areaDemandante} ${d.categoria}`
              .toLowerCase()
              .includes(termo)
      ),
    [desafios, termo]
  );

  // "Vincular" em um item da listagem: preenche o formulário e leva até ele
  function escolherIdeia(id: string) {
    setIdIdeia(id);
    setErroForm('');
    setSucesso('');
    secaoFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escolherDesafio(id: string) {
    setIdDesafio(id);
    setErroForm('');
    setSucesso('');
    secaoFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mudarAba(nova: Aba) {
    setAba(nova);
    setBusca('');
  }

  async function handleVincular(evento: React.SyntheticEvent) {
    evento.preventDefault();

    // um segundo clique antes do primeiro terminar é ignorado
    if (enviandoRef.current) return;

    setErroForm('');
    setSucesso('');

    if (!idIdeia || !idDesafio) {
      setErroForm('Escolha a ideia e o desafio que serão vinculados.');
      return;
    }

    if (justificativa.length > LIMITE_JUSTIFICATIVA) {
      setErroForm(`A justificativa aceita até ${LIMITE_JUSTIFICATIVA} caracteres.`);
      return;
    }

    if (paresExistentes.has(chaveDoPar(Number(idIdeia), Number(idDesafio)))) {
      setErroForm('Esta ideia já está vinculada a este desafio.');
      return;
    }

    enviandoRef.current = true;
    setSalvando(true);

    try {
      const novo = await criarMatch({
        id_ideia:      Number(idIdeia),
        id_desafio:    Number(idDesafio),
        justificativa: justificativa.trim() || null,
      });

      setMatches((lista) => [novo, ...lista]);
      setSucesso(
        `Vínculo criado: ${novo.ideia_codigo ?? `Ideia #${novo.id_ideia}`} → ` +
          `${codigoDesafio(novo.id_desafio)}.`
      );
      setIdIdeia('');
      setIdDesafio('');
      setJustificativa('');
    } catch (e) {
      setErroForm(descreverErro(e));
    } finally {
      enviandoRef.current = false;
      setSalvando(false);
    }
  }

  if (!ehAnalista) {
    return (
      <div className="match-container">
        <Alert variant="error">
          Apenas o Analista/Hub pode acessar o Match entre ideias e desafios.
        </Alert>
      </div>
    );
  }

  const opcoesIdeias = ideiasDisponiveis.map((ideia) => ({
    value: ideia.id,
    label: `${ideia.codigo || `#${ideia.id}`} — ${ideia.titulo}`,
  }));

  const opcoesDesafios = desafios.map((desafio) => ({
    value: desafio.id,
    label: `${codigoDesafio(desafio.id)} — ${desafio.titulo}`,
  }));

  const opcoesFiltro = [
    { value: TODOS, label: 'Todos os desafios' },
    ...opcoesDesafios,
  ];

  const semDadosParaVincular =
    !carregando && !erroCarga && (opcoesIdeias.length === 0 || opcoesDesafios.length === 0);

  return (
    <div className="match-container">
      <div className="match-header">
        <h1>Match Ideia × Desafio</h1>
        <p>Relacione ideias a desafios e consulte os vínculos já criados</p>
      </div>

      <div className="match-aviso">
        O vínculo criado aqui é manual: ele é salvo como validado por você e
        uma mesma ideia não pode ser ligada duas vezes ao mesmo desafio.
      </div>

      {erroCarga && (
        <div className="match-bloco">
          <Alert variant="error">{erroCarga}</Alert>
          <button className="match-btn-secundario" onClick={tentarNovamente}>
            Tentar novamente
          </button>
        </div>
      )}

      {carregando && (
        <p className="match-estado" role="status">
          Carregando ideias, desafios e vínculos...
        </p>
      )}

      {!carregando && !erroCarga && (
        <>
          {/* Novo vínculo */}
          <section
            ref={secaoFormRef}
            className="match-card"
            aria-labelledby="match-novo-titulo"
          >
            <h2 id="match-novo-titulo">Novo vínculo</h2>

            {semDadosParaVincular ? (
              <p className="match-estado">
                {opcoesIdeias.length === 0
                  ? 'Não há ideias disponíveis para vincular.'
                  : 'Não há desafios cadastrados para vincular.'}
              </p>
            ) : (
              <form className="match-form" onSubmit={handleVincular} noValidate>
                <Select
                  label="Ideia"
                  required
                  options={opcoesIdeias}
                  placeholder="Selecione a ideia"
                  value={idIdeia}
                  onChange={(e) => setIdIdeia(e.target.value)}
                  helperText={
                    ideiaEscolhida
                      ? `Proposta originalmente para ${
                          ideiaEscolhida.desafioId
                            ? codigoDesafio(ideiaEscolhida.desafioId)
                            : 'um desafio'
                        }` +
                        (ideiaEscolhida.desafio
                          ? ` — ${ideiaEscolhida.desafio}`
                          : '') +
                        `. Status: ${rotuloStatusIdeia(ideiaEscolhida.status)}.`
                      : undefined
                  }
                />

                <Select
                  label="Desafio"
                  required
                  options={opcoesDesafios}
                  placeholder="Selecione o desafio"
                  value={idDesafio}
                  onChange={(e) => setIdDesafio(e.target.value)}
                />

                <Textarea
                  label="Justificativa (opcional)"
                  rows={3}
                  maxLength={LIMITE_JUSTIFICATIVA}
                  placeholder="Por que esta ideia atende a este desafio?"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />

                {erroForm && <Alert variant="error">{erroForm}</Alert>}

                <div className="match-form-acoes">
                  <Button type="submit" isLoading={salvando} loadingText="Vinculando...">
                    Vincular ideia ao desafio
                  </Button>
                </div>
              </form>
            )}

            {sucesso && (
              <div className="match-sucesso" role="status">
                {sucesso}
              </div>
            )}
          </section>

          {/* Listagem de ideias e desafios */}
          <section className="match-card" aria-labelledby="match-catalogo-titulo">
            <h2 id="match-catalogo-titulo">Ideias e desafios</h2>

            <div className="match-abas" role="tablist" aria-label="Ideias ou desafios">
              <button
                type="button"
                role="tab"
                aria-selected={aba === 'ideias'}
                className={`match-aba ${aba === 'ideias' ? 'ativa' : ''}`}
                onClick={() => mudarAba('ideias')}
              >
                Ideias ({ideias.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={aba === 'desafios'}
                className={`match-aba ${aba === 'desafios' ? 'ativa' : ''}`}
                onClick={() => mudarAba('desafios')}
              >
                Desafios ({desafios.length})
              </button>
            </div>

            <input
              type="search"
              className="match-busca"
              aria-label={aba === 'ideias' ? 'Buscar ideias' : 'Buscar desafios'}
              placeholder="Buscar por código, título, área ou categoria"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {aba === 'ideias' && (
              <>
                {ideias.length === 0 && (
                  <p className="match-estado">Nenhuma ideia cadastrada ainda.</p>
                )}

                {ideias.length > 0 && ideiasListadas.length === 0 && (
                  <p className="match-estado">Nenhuma ideia encontrada para a busca.</p>
                )}

                <div className="match-lista">
                  {ideiasListadas.map((ideia) => {
                    const qtd = vinculosPorIdeia.get(Number(ideia.id)) ?? 0;

                    return (
                      <article key={ideia.id} className="match-item">
                        <div className="match-item-topo">
                          <span className="match-codigo">
                            {ideia.codigo || `#${ideia.id}`}
                          </span>
                          <span className="match-selo">
                            {rotuloStatusIdeia(ideia.status)}
                          </span>
                          <span className="match-contagem">
                            {qtd} {qtd === 1 ? 'vínculo' : 'vínculos'}
                          </span>
                        </div>

                        <p className="match-item-titulos">
                          <strong>{ideia.titulo}</strong>
                        </p>

                        <p className="match-item-rodape">
                          Proposta para {ideia.desafioId ? codigoDesafio(ideia.desafioId) : 'um desafio'}
                          {ideia.desafio ? ` — ${ideia.desafio}` : ''}
                          {ideia.areaOrigem ? ` · ${ideia.areaOrigem}` : ''}
                          {ideia.categoria ? ` · ${ideia.categoria}` : ''}
                        </p>

                        <div className="match-item-acoes">
                          {ideiaArquivada(ideia) ? (
                            <span className="match-nota">
                              Ideia arquivada não pode ser vinculada.
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="match-btn-secundario"
                              onClick={() => escolherIdeia(ideia.id)}
                            >
                              Vincular a um desafio
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {aba === 'desafios' && (
              <>
                {desafios.length === 0 && (
                  <p className="match-estado">Nenhum desafio cadastrado ainda.</p>
                )}

                {desafios.length > 0 && desafiosListados.length === 0 && (
                  <p className="match-estado">Nenhum desafio encontrado para a busca.</p>
                )}

                <div className="match-lista">
                  {desafiosListados.map((desafio) => {
                    const qtd = vinculosPorDesafio.get(Number(desafio.id)) ?? 0;

                    return (
                      <article key={desafio.id} className="match-item">
                        <div className="match-item-topo">
                          <span className="match-codigo">
                            {codigoDesafio(desafio.id)}
                          </span>
                          <span className="match-selo">
                            {rotuloStatusDesafio(desafio.status)}
                          </span>
                          <span className="match-contagem">
                            {qtd} {qtd === 1 ? 'vínculo' : 'vínculos'}
                          </span>
                        </div>

                        <p className="match-item-titulos">
                          <strong>{desafio.titulo}</strong>
                        </p>

                        <p className="match-item-rodape">
                          {desafio.areaDemandante}
                          {desafio.impacto ? ` · Impacto ${desafio.impacto}` : ''}
                          {desafio.urgencia ? ` · Urgência ${desafio.urgencia}` : ''}
                        </p>

                        <div className="match-item-acoes">
                          <button
                            type="button"
                            className="match-btn-secundario"
                            onClick={() => escolherDesafio(desafio.id)}
                          >
                            Vincular uma ideia
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* Vínculos existentes */}
          <section className="match-card" aria-labelledby="match-lista-titulo">
            <div className="match-lista-topo">
              <h2 id="match-lista-titulo">
                Vínculos existentes ({matchesFiltrados.length})
              </h2>

              {matches.length > 0 && (
                <div className="match-filtro">
                  <Select
                    label="Filtrar por desafio"
                    options={opcoesFiltro}
                    value={filtroDesafio}
                    onChange={(e) => setFiltroDesafio(e.target.value)}
                  />
                </div>
              )}
            </div>

            {matches.length === 0 && (
              <p className="match-estado">
                Nenhum vínculo criado ainda. Use o formulário acima para
                relacionar uma ideia a um desafio.
              </p>
            )}

            {matches.length > 0 && matchesFiltrados.length === 0 && (
              <p className="match-estado">Nenhum vínculo para este desafio.</p>
            )}

            <div className="match-lista">
              {matchesFiltrados.map((match) => (
                <article key={match.id_match} className="match-item">
                  <div className="match-item-topo">
                    <span className="match-codigo">
                      {match.ideia_codigo ?? `Ideia #${match.id_ideia}`}
                    </span>
                    <span className="match-seta" aria-hidden="true">→</span>
                    <span className="match-codigo">{codigoDesafio(match.id_desafio)}</span>

                    <span className={`match-selo ${classeStatusMatch(match.status_match)}`}>
                      {rotuloStatusMatch(match.status_match)}
                    </span>
                    <span className="match-selo match-selo-origem">
                      {rotuloOrigemMatch(match.origem_match)}
                    </span>
                  </div>

                  <p className="match-item-titulos">
                    <strong>{match.ideia_titulo ?? 'Ideia sem título'}</strong>
                    {' '}→{' '}
                    {match.desafio_titulo ?? 'Desafio sem título'}
                  </p>

                  {match.justificativa && (
                    <p className="match-item-justificativa">{match.justificativa}</p>
                  )}

                  <p className="match-item-rodape">
                    Criado em {formatarData(match.data_criacao)}
                    {match.score_compatibilidade !== null &&
                      ` · Compatibilidade ${match.score_compatibilidade}`}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
