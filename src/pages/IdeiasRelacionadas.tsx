import { useEffect, useRef, useState } from 'react';
import { consultarDesafio, listarDesafios } from '../services/desafioService';
import {
  aceitarIdeia,
  arquivarIdeia,
  consultarIdeia,
  listarTodasIdeias,
  rejeitarIdeia,
} from '../services/ideiaService';
import type { Ideia } from '../types/ideia';
import './IdeiasRelacionadas.css';

interface IdeiasRelacionadasProps {
  desafioId?: string;
  gestorId?: string;
}

const statusParaDecisao = new Set(['submetida', 'nova', 'em_avaliacao', 'em avaliação']);
const acoes = {
  aceitar: { rotulo: 'Aceitar', executar: aceitarIdeia, sucesso: 'Ideia aceita.' },
  rejeitar: { rotulo: 'Rejeitar', executar: rejeitarIdeia, sucesso: 'Ideia rejeitada.' },
  arquivar: { rotulo: 'Arquivar', executar: arquivarIdeia, sucesso: 'Ideia arquivada.' },
};

function classeStatus(status: string) {
  switch (status.trim().toLowerCase()) {
    case 'aprovada':
    case 'aceita':
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

export const IdeiasRelacionadas = ({ desafioId, gestorId }: IdeiasRelacionadasProps) => {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [acaoPendente, setAcaoPendente] = useState(false);
  const [revisao, setRevisao] = useState(0);
  const [desafiosDoGestor, setDesafiosDoGestor] = useState(new Set<string>());
  const [erroPermissoes, setErroPermissoes] = useState(false);
  const [ideiaSelecionada, setIdeiaSelecionada] = useState<Ideia | null>(null);
  const [detalhes, setDetalhes] = useState<Ideia | null>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [erroDetalhes, setErroDetalhes] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const idSelecionado = ideiaSelecionada?.id;
  const modalAberto = ideiaSelecionada !== null;

  useEffect(() => {
    let ativo = true;
    listarTodasIdeias({ desafioId })
      .then(async (resultado) => {
        if (!ativo) return;
        setIdeias(resultado);
        if (!gestorId) return;

        try {
          const responsavelPor = new Set<string>();
          if (resultado.length && desafioId) {
            const desafio = await consultarDesafio(desafioId);
            if (String(desafio.id_responsavel) === gestorId) responsavelPor.add(String(desafio.id_desafio));
          } else if (resultado.some((ideia) => ideia.desafioId)) {
            const desafios = await listarDesafios();
            for (const desafio of desafios) {
              if (desafio.responsavelId === gestorId) responsavelPor.add(desafio.id);
            }
          }
          if (ativo) setDesafiosDoGestor(responsavelPor);
        } catch {
          if (ativo) {
            setDesafiosDoGestor(new Set());
            setErroPermissoes(true);
          }
        }
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar as ideias relacionadas.',
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [desafioId, gestorId, revisao]);

  function podeExecutar(ideia: Ideia, acao: keyof typeof acoes) {
    if (!gestorId || !ideia.id) return false;

    const status = ideia.status.trim().toLowerCase().replace(/-/g, '_');
    const responsavel = desafiosDoGestor.has(ideia.desafioId);

    if (acao === 'arquivar') {
      return status !== 'arquivada' && (responsavel || ideia.usuarioId === gestorId);
    }

    return responsavel && statusParaDecisao.has(status);
  }

  async function executarAcao(ideia: Ideia, acao: keyof typeof acoes) {
    if (acaoPendente || carregando || erro || !podeExecutar(ideia, acao)) return;

    const { rotulo, executar, sucesso: mensagem } = acoes[acao];
    if (!window.confirm(`${rotulo} a ideia “${ideia.titulo}”?`)) return;

    setAcaoPendente(true);
    setErroAcao('');
    setSucesso('');

    try {
      await executar(ideia.id);
      setSucesso(mensagem);
      recarregarLista();
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível alterar o status da ideia.');
    } finally {
      setAcaoPendente(false);
    }
  }

  function recarregarLista() {
    setCarregando(true);
    setErro('');
    setErroPermissoes(false);
    setRevisao((atual) => atual + 1);
  }

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
    setCarregandoDetalhes(Boolean(ideia.id));
    setIdeiaSelecionada(ideia);
  }

  function fecharDetalhes() {
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

  return (
    <div className="ideias-relacionadas-page" aria-busy={carregando}>
      <header className="ideias-relacionadas-page__header">
        <h1>Ideias Relacionadas</h1>
        <p>
          {desafioId
            ? `Ideias propostas para o desafio #${desafioId}`
            : 'Ideias propostas para os desafios sob sua responsabilidade.'}
        </p>
      </header>

      <div className="ideias-relacionadas-page__aviso">
        <span
          aria-hidden="true"
          className="ideias-relacionadas-page__aviso-icone"
        >
          i
        </span>
        <p>
          O Gestor Demandante pode aceitar ou rejeitar ideias dos desafios sob
          sua responsabilidade e arquivar ideias desses desafios ou de sua
          autoria. O Analista/Hub de Inovação continua responsável pela
          avaliação, triagem e aprovação das ideias.
        </p>
      </div>

      {carregando && (
        <p className="ideias-relacionadas-page__estado" role="status">
          Carregando ideias...
        </p>
      )}
      {sucesso && (
        <p className="ideias-relacionadas-page__estado ideias-relacionadas-page__estado--sucesso" role="status">
          {sucesso}
        </p>
      )}
      {(erro || erroAcao || erroPermissoes) && (
        <p
          className="ideias-relacionadas-page__estado ideias-relacionadas-page__estado--erro"
          role="alert"
        >
          {erro || erroAcao || 'Não foi possível verificar a responsabilidade por todos os desafios.'}
          {(erro || erroPermissoes) && (
            <button
              type="button"
              className="ideias-relacionadas-page__btn"
              disabled={carregando || acaoPendente}
              onClick={recarregarLista}
            >
              Atualizar lista
            </button>
          )}
        </p>
      )}
      {!carregando && !erro && ideias.length === 0 && (
        <p className="ideias-relacionadas-page__estado">
          Nenhuma ideia relacionada foi encontrada.
        </p>
      )}

      {ideias.length > 0 && (
        <section
          className="ideias-relacionadas-page__lista"
          aria-label="Ideias submetidas"
        >
          {ideias.map((ideia) => (
            <article key={ideia.id} className="ideias-relacionadas-page__card">
              <div className="ideias-relacionadas-page__card-header">
                <div className="ideias-relacionadas-page__identificacao">
                  <span className="ideias-relacionadas-page__codigo">
                    {ideia.codigo || `IDE-${ideia.id}`}
                  </span>
                  <span
                    className={`ideias-relacionadas-page__status ideias-relacionadas-page__status--${classeStatus(ideia.status)}`}
                  >
                    {ideia.status || 'Sem status'}
                  </span>
                </div>
                {ideia.data && (
                  <span className="ideias-relacionadas-page__data">
                    Enviada em {ideia.data}
                  </span>
                )}
              </div>

              <h2>{ideia.titulo}</h2>
              <p className="ideias-relacionadas-page__descricao">
                {ideia.descricao || 'Descrição não informada.'}
              </p>

              <dl className="ideias-relacionadas-page__metadados">
                <div>
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
                <div className="ideias-relacionadas-page__beneficio">
                  <strong>Benefício esperado</strong>
                  <p>{ideia.beneficioEsperado}</p>
                </div>
              )}

              <footer className="ideias-relacionadas-page__card-footer">
                {(Object.keys(acoes) as (keyof typeof acoes)[])
                  .filter((acao) => podeExecutar(ideia, acao))
                  .map((acao) => (
                    <button
                      key={acao}
                      type="button"
                      className="ideias-relacionadas-page__btn ideias-relacionadas-page__acao"
                      disabled={acaoPendente || carregando || Boolean(erro)}
                      onClick={() => void executarAcao(ideia, acao)}
                      aria-label={`${acoes[acao].rotulo} a ideia ${ideia.titulo}`}
                    >
                      {acoes[acao].rotulo}
                    </button>
                  ))}
                <button
                  type="button"
                  className="ideias-relacionadas-page__abrir"
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
        className="ideias-relacionadas-page__modal"
        aria-labelledby="ideia-preview-titulo"
        aria-describedby="ideia-preview-descricao"
        onCancel={(event) => {
          event.preventDefault();
          fecharDetalhes();
        }}
      >
        {ideiaSelecionada && (
          <div
            className="ideias-relacionadas-page__modal-conteudo"
            aria-busy={carregandoDetalhes}
          >
            <header className="ideias-relacionadas-page__modal-header">
              <div>
                <h2 id="ideia-preview-titulo">Detalhes da ideia</h2>
                <p id="ideia-preview-descricao">
                  Proposta submetida pelo colaborador.
                </p>
              </div>
              <button
                type="button"
                className="ideias-relacionadas-page__fechar"
                aria-label="Fechar detalhes"
                onClick={fecharDetalhes}
              >
                ×
              </button>
            </header>

            {carregandoDetalhes && (
              <p className="ideias-relacionadas-page__estado" role="status">
                Consultando informações da ideia...
              </p>
            )}
            {erroDetalhes && (
              <p className="ideias-relacionadas-page__estado" role="alert">
                {erroDetalhes}
              </p>
            )}

            <div className="ideias-relacionadas-page__modal-identificacao">
              <span className="ideias-relacionadas-page__codigo">
                {obterCampo('codigo') || `IDE-${obterCampo('id')}`}
              </span>
              <span
                className={`ideias-relacionadas-page__status ideias-relacionadas-page__status--${classeStatus(statusPreview)}`}
              >
                {statusPreview || 'Sem status'}
              </span>
            </div>

            <h3 className="ideias-relacionadas-page__modal-titulo-ideia">
              {obterCampo('titulo') || 'Título não informado'}
            </h3>

            <dl className="ideias-relacionadas-page__modal-dados">
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
              <div className="ideias-relacionadas-page__modal-campo-largo">
                <dt>Descrição da solução proposta</dt>
                <dd>{obterCampo('descricao') || 'Não informada'}</dd>
              </div>
              <div className="ideias-relacionadas-page__modal-campo-largo">
                <dt>Problema que a ideia resolve</dt>
                <dd>{obterCampo('problemaResolvido') || 'Não informado'}</dd>
              </div>
              <div className="ideias-relacionadas-page__modal-campo-largo">
                <dt>Benefício esperado</dt>
                <dd>{obterCampo('beneficioEsperado') || 'Não informado'}</dd>
              </div>
            </dl>

            <footer className="ideias-relacionadas-page__modal-acoes">
              <button
                type="button"
                className="ideias-relacionadas-page__btn"
                onClick={fecharDetalhes}
              >
                Fechar
              </button>
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
};
