import { useEffect, useRef, useState, type FormEvent } from 'react';
import { arquivarIdeia, atualizarIdeia, consultarIdeia, listarTodasIdeias } from '../services/ideiaService';
import type { Ideia } from '../types/ideia';
import './MinhasIdeias.css';

function classeStatus(status: string) {
  switch (status.trim().toLowerCase()) {
    case 'aprovada':
      return 'aprovada';
    case 'em match':
    case 'em triagem':
      return 'analise';
    case 'submetida':
    case 'nova':
      return 'submetida';
    default:
      return 'neutra';
  }
}

export function MinhasIdeias() {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [ideiaSelecionada, setIdeiaSelecionada] = useState<Ideia | null>(null);
  const [detalhes, setDetalhes] = useState<Ideia | null>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [erroDetalhes, setErroDetalhes] = useState('');
  const [rascunho, setRascunho] = useState<Pick<Ideia, 'titulo' | 'descricao' | 'areaOrigem' | 'categoria' | 'beneficioEsperado' | 'problemaResolvido'> | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const idSelecionado = ideiaSelecionada?.id;
  const modalAberto = ideiaSelecionada !== null;

  useEffect(() => {
    let ativo = true;
    listarTodasIdeias({ minhas: true })
      .then((resultado) => {
        if (ativo) setIdeias(resultado);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar suas ideias.',
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal || !modalAberto) return;

    modal.showModal();

    return () => {
      modal.close();
    };
  }, [modalAberto]);

  useEffect(() => {
    if (!idSelecionado) return;

    let ativo = true;

    consultarIdeia(idSelecionado)
      .then((resultado) => {
        if (ativo) setDetalhes(resultado);
      })
      .catch(() => {
        if (ativo)
          setErroDetalhes(
            'Não foi possível atualizar os detalhes. Exibindo as informações da lista.',
          );
      })
      .finally(() => {
        if (ativo) setCarregandoDetalhes(false);
      });

    return () => {
      ativo = false;
    };
  }, [idSelecionado]);

  function abrirDetalhes(ideia: Ideia) {
    setDetalhes(null);
    setErroDetalhes('');
    setMensagem('');
    setCarregandoDetalhes(Boolean(ideia.id));
    setIdeiaSelecionada(ideia);
  }

  function fecharDetalhes() {
    if (salvando) return;
    setRascunho(null);
    setIdeiaSelecionada(null);
    setDetalhes(null);
    setCarregandoDetalhes(false);
    setErroDetalhes('');
  }

  function obterCampo(campo: keyof Ideia) {
    return detalhes?.[campo] || ideiaSelecionada?.[campo] || '';
  }

  const desafioPreview =
    obterCampo('desafio') ||
    (obterCampo('desafioId') ? `Desafio #${obterCampo('desafioId')}` : '');

  const statusPreview = obterCampo('status');
  const podeEditar = ['submetida', 'nova', 'rascunho'].includes(statusPreview.trim().toLowerCase());

  async function salvar(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!idSelecionado || !podeEditar || salvando || carregandoDetalhes) return;
    if (!event && !window.confirm(`Arquivar a ideia “${obterCampo('titulo')}”?`)) return;
    if (event && (!rascunho || rascunho.titulo.trim().length < 3 || rascunho.descricao.trim().length < 10)) {
      setErroDetalhes('Use pelo menos 3 caracteres no título e 10 na descrição.');
      return;
    }
    setSalvando(true);
    setErroDetalhes('');
    setMensagem('');
    try {
      const atualizada = event && rascunho
        ? await atualizarIdeia(idSelecionado, {
            titulo: rascunho.titulo.trim(),
            descricao: rascunho.descricao.trim(),
            area: rascunho.areaOrigem,
            categoria: rascunho.categoria,
            beneficio_esperado: rascunho.beneficioEsperado,
            problema_resolvido: rascunho.problemaResolvido,
          })
        : await arquivarIdeia(idSelecionado);
      setDetalhes(atualizada);
      setIdeiaSelecionada(atualizada);
      setIdeias((atuais) => atuais.map((item) => item.id === atualizada.id ? atualizada : item));
      setRascunho(null);
      setMensagem(event ? 'Ideia atualizada.' : 'Ideia arquivada.');
    } catch (error) {
      setErroDetalhes(error instanceof Error ? error.message : 'Não foi possível alterar a ideia.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="minhas-ideias-page" aria-busy={carregando}>
      <header className="minhas-ideias-page__header">
        <h1>Minhas Ideias</h1>
        <p>Ideias que você submeteu ao sistema.</p>
      </header>

      {carregando && (
        <p className="minhas-ideias-page__estado" role="status">
          Carregando suas ideias...
        </p>
      )}
      {erro && (
        <p
          className="minhas-ideias-page__estado minhas-ideias-page__estado--erro"
          role="alert"
        >
          {erro}
        </p>
      )}
      {!carregando && !erro && ideias.length === 0 && (
        <p className="minhas-ideias-page__estado">
          Você ainda não submeteu nenhuma ideia.
        </p>
      )}

      {ideias.length > 0 && (
        <section
          className="minhas-ideias-page__lista"
          aria-label="Minhas ideias submetidas"
        >
          {ideias.map((ideia) => (
            <article key={ideia.id} className="minhas-ideias-page__card">
              <div className="minhas-ideias-page__card-header">
                <div className="minhas-ideias-page__identificacao">
                  <span className="minhas-ideias-page__codigo">
                    {ideia.codigo || `IDE-${ideia.id}`}
                  </span>
                  <span
                    className={`minhas-ideias-page__status minhas-ideias-page__status--${classeStatus(ideia.status)}`}
                  >
                    {ideia.status || 'Sem status'}
                  </span>
                </div>
                {ideia.data && (
                  <span className="minhas-ideias-page__data">
                    Submetida em {ideia.data}
                  </span>
                )}
              </div>

              <h2>{ideia.titulo}</h2>
              <p className="minhas-ideias-page__descricao">
                {ideia.descricao || 'Descrição não informada.'}
              </p>

              <dl className="minhas-ideias-page__metadados">
                <div className="minhas-ideias-page__meta-largo">
                  <dt>Desafio vinculado</dt>
                  <dd>
                    {ideia.desafio ||
                      (ideia.desafioId
                        ? `Desafio #${ideia.desafioId}`
                        : 'Não informado')}
                  </dd>
                </div>
                <div>
                  <dt>Área de origem</dt>
                  <dd>{ideia.areaOrigem || 'Não informada'}</dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>{ideia.categoria || 'Não informada'}</dd>
                </div>
              </dl>

              {ideia.beneficioEsperado && (
                <div className="minhas-ideias-page__beneficio">
                  <strong>Benefício esperado</strong>
                  <p>{ideia.beneficioEsperado}</p>
                </div>
              )}

              <footer className="minhas-ideias-page__card-footer">
                <button
                  type="button"
                  className="minhas-ideias-page__abrir"
                  onClick={() => abrirDetalhes(ideia)}
                  aria-label={`Ver detalhes da ideia ${ideia.titulo}`}
                >
                  Ver detalhes <span aria-hidden="true">→</span>
                </button>
              </footer>
            </article>
          ))}
        </section>
      )}

      <dialog
        ref={modalRef}
        className="minhas-ideias-page__modal"
        aria-labelledby="ideia-preview-titulo"
        aria-describedby="ideia-preview-descricao"
        onCancel={(event) => {
          event.preventDefault();
          fecharDetalhes();
        }}
      >
        {ideiaSelecionada && (
          <div
            className="minhas-ideias-page__modal-conteudo"
            aria-busy={carregandoDetalhes}
          >
            <header className="minhas-ideias-page__modal-header">
              <div>
                <h2 id="ideia-preview-titulo">Detalhes da ideia</h2>
                <p id="ideia-preview-descricao">
                  Confira os dados da sua proposta.
                </p>
              </div>
              <button
                type="button"
                className="minhas-ideias-page__fechar"
                aria-label="Fechar detalhes"
                onClick={fecharDetalhes}
              >
                ×
              </button>
            </header>

            {carregandoDetalhes && (
              <p className="minhas-ideias-page__estado" role="status">
                Consultando informações da ideia...
              </p>
            )}
            {erroDetalhes && (
              <p className="minhas-ideias-page__estado" role="alert">
                {erroDetalhes}
              </p>
            )}

            <div className="minhas-ideias-page__modal-identificacao">
              <span className="minhas-ideias-page__codigo">
                {obterCampo('codigo') || `IDE-${obterCampo('id')}`}
              </span>
              <span
                className={`minhas-ideias-page__status minhas-ideias-page__status--${classeStatus(statusPreview)}`}
              >
                {statusPreview || 'Sem status'}
              </span>
            </div>

            <h3 className="minhas-ideias-page__modal-titulo-ideia">
              {obterCampo('titulo') || 'Título não informado'}
            </h3>

            <dl className="minhas-ideias-page__modal-dados">
              <div>
                <dt>Desafio vinculado</dt>
                <dd>{desafioPreview || 'Não informado'}</dd>
              </div>
              <div>
                <dt>ID do desafio</dt>
                <dd>{obterCampo('desafioId') || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Área de origem</dt>
                <dd>{obterCampo('areaOrigem') || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Categoria</dt>
                <dd>{obterCampo('categoria') || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Data de submissão</dt>
                <dd>{obterCampo('data') || 'Não informada'}</dd>
              </div>
              <div>
                <dt>ID do autor</dt>
                <dd>{obterCampo('usuarioId') || 'Não informado'}</dd>
              </div>
              <div className="minhas-ideias-page__modal-campo-largo">
                <dt>Descrição da solução proposta</dt>
                <dd>{obterCampo('descricao') || 'Não informada'}</dd>
              </div>
              <div className="minhas-ideias-page__modal-campo-largo">
                <dt>Problema que a ideia resolve</dt>
                <dd>{obterCampo('problemaResolvido') || 'Não informado'}</dd>
              </div>
              <div className="minhas-ideias-page__modal-campo-largo">
                <dt>Benefício esperado</dt>
                <dd>{obterCampo('beneficioEsperado') || 'Não informado'}</dd>
              </div>
            </dl>

            <footer className="minhas-ideias-page__modal-acoes">
              {podeEditar && !rascunho && (
                <>
                  <button type="button" className="minhas-ideias-page__btn" disabled={salvando || carregandoDetalhes}
                    onClick={() => setRascunho(detalhes ?? ideiaSelecionada)}>
                    Editar
                  </button>
                  <button type="button" className="minhas-ideias-page__btn" disabled={salvando || carregandoDetalhes}
                    onClick={() => void salvar()}>
                    Arquivar
                  </button>
                </>
              )}
              <button
                type="button"
                className="minhas-ideias-page__btn"
                onClick={fecharDetalhes}
                disabled={salvando}
              >
                Fechar
              </button>
            </footer>
            {mensagem && <p role="status">{mensagem}</p>}
            {rascunho && (
              <form onSubmit={salvar} className="minhas-ideias-page__form">
                <fieldset disabled={salvando}>
                  <label>Título<input value={rascunho.titulo} required minLength={3} maxLength={150} onChange={(event) => setRascunho({ ...rascunho, titulo: event.target.value })} /></label>
                  <label>Descrição<textarea value={rascunho.descricao} required minLength={10} maxLength={5000} onChange={(event) => setRascunho({ ...rascunho, descricao: event.target.value })} /></label>
                  <label>Área<input value={rascunho.areaOrigem} maxLength={100} onChange={(event) => setRascunho({ ...rascunho, areaOrigem: event.target.value })} /></label>
                  <label>Categoria<input value={rascunho.categoria} maxLength={100} onChange={(event) => setRascunho({ ...rascunho, categoria: event.target.value })} /></label>
                  <label>Problema que a ideia resolve<textarea value={rascunho.problemaResolvido ?? ''} maxLength={5000} onChange={(event) => setRascunho({ ...rascunho, problemaResolvido: event.target.value })} /></label>
                  <label>Benefício esperado<textarea value={rascunho.beneficioEsperado} maxLength={5000} onChange={(event) => setRascunho({ ...rascunho, beneficioEsperado: event.target.value })} /></label>
                  <button type="submit" className="minhas-ideias-page__btn">{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
                  <button type="button" className="minhas-ideias-page__btn" onClick={() => setRascunho(null)}>Cancelar edição</button>
                </fieldset>
              </form>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
