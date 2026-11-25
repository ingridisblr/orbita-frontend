import { useEffect, useRef, useState, type FormEvent } from 'react';
import './MVP.css';

export interface EvidenciaMvp {
  id: string;
  titulo: string;
  descricao?: string;
}

export interface DadosMvp {
  projeto: string;
  hipotese: string;
  objetivo: string;
  criterioSucesso: string;
  metrica: string;
  prazo: string;
  status: string;
}

export interface RegistroMvp extends DadosMvp {
  id: string;
  codigo: string;
  quantidadeEvidencias?: number;
  evidencias?: readonly EvidenciaMvp[];
}

export interface MVPProps {
  mvps?: readonly RegistroMvp[];
  carregando?: boolean;
  erro?: string;
  onSalvarMvp?: (dados: DadosMvp, id?: string) => Promise<void> | void;
}

type ModalMvp =
  | { tipo: 'formulario'; dados: DadosMvp; id?: string }
  | { tipo: 'evidencias'; mvp: RegistroMvp };

const dadosIniciais: DadosMvp = {
  projeto: '',
  hipotese: '',
  objetivo: '',
  criterioSucesso: '',
  metrica: '',
  prazo: '',
  status: 'Em andamento',
};

const opcoesStatus = ['Em andamento', 'Meta atingida', 'Meta não atingida'];

export function MVP({
  mvps,
  carregando = false,
  erro = '',
  onSalvarMvp,
}: MVPProps) {
  const [modal, setModal] = useState<ModalMvp | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalAberto = modal !== null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !modalAberto) return;

    dialog.showModal();
    dialog.querySelector('input')?.focus();

    return () => {
      dialog.close();
    };
  }, [modalAberto]);

  function abrirFormulario(mvp?: RegistroMvp) {
    setMensagem('');
    setErroAcao('');

    const dados = mvp
      ? {
          projeto: mvp.projeto,
          hipotese: mvp.hipotese,
          objetivo: mvp.objetivo,
          criterioSucesso: mvp.criterioSucesso,
          metrica: mvp.metrica,
          prazo: mvp.prazo,
          status: mvp.status,
        }
      : { ...dadosIniciais };

    setModal({ tipo: 'formulario', dados, id: mvp?.id });
  }

  function abrirEvidencias(mvp: RegistroMvp) {
    setErroAcao('');
    setModal({ tipo: 'evidencias', mvp });
  }

  function fecharModal() {
    if (salvando) return;
    setModal(null);
    setErroAcao('');
  }

  function alterarCampo(campo: keyof DadosMvp, valor: string) {
    setModal((anterior) => {
      if (!anterior || anterior.tipo !== 'formulario') return anterior;
      return { ...anterior, dados: { ...anterior.dados, [campo]: valor } };
    });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!modal || modal.tipo !== 'formulario' || !onSalvarMvp || salvando || carregando || erro) return;

    const { dados, id } = modal;
    const dadosTratados: DadosMvp = {
      projeto: dados.projeto.trim(),
      hipotese: dados.hipotese.trim(),
      objetivo: dados.objetivo.trim(),
      criterioSucesso: dados.criterioSucesso.trim(),
      metrica: dados.metrica.trim(),
      prazo: dados.prazo,
      status: dados.status,
    };

    if (Object.values(dadosTratados).some((valor) => !valor)) {
      setErroAcao('Preencha todos os campos para salvar o MVP.');
      return;
    }

    setSalvando(true);
    setErroAcao('');
    setMensagem('');

    try {
      await onSalvarMvp(dadosTratados, id);
      setModal(null);
      setMensagem(id ? 'MVP atualizado com sucesso.' : 'MVP cadastrado com sucesso.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível salvar o MVP.');
    } finally {
      setSalvando(false);
    }
  }

  const bloqueado = carregando || Boolean(erro) || salvando;

  return (
    <div className="mvp-page" aria-busy={carregando || salvando}>
      <header className="mvp-page__header">
        <div>
          <h1>MVP</h1>
          <p>Hipóteses e validação de soluções em campo.</p>
        </div>
        <button
          type="button"
          className="mvp-page__btn mvp-page__btn--primario"
          onClick={() => abrirFormulario()}
          disabled={bloqueado}
        >
          <span aria-hidden="true">+</span> Novo MVP
        </button>
      </header>

      {carregando && <p className="mvp-page__estado" role="status">Carregando MVPs...</p>}
      {erro && <p className="mvp-page__estado mvp-page__erro" role="alert">{erro}</p>}
      {mensagem && <p className="mvp-page__estado mvp-page__sucesso" role="status">{mensagem}</p>}

      <section className="mvp-page__lista" aria-label="MVPs cadastrados">
        {mvps?.map((mvp) => {
          const status = mvp.status.trim().toLowerCase();
          const quantidade = mvp.quantidadeEvidencias ?? mvp.evidencias?.length;

          return (
            <article className="mvp-page__card" key={mvp.id}>
              <header className="mvp-page__card-header">
                <div>
                  <p className="mvp-page__codigo">{mvp.codigo} · {mvp.projeto}</p>
                  <h2>{mvp.hipotese}</h2>
                </div>
                <span
                  className={`mvp-page__status ${status === 'meta atingida' ? 'mvp-page__status--atingida' : status === 'em andamento' ? 'mvp-page__status--andamento' : ''}`}
                >
                  {mvp.status}
                </span>
              </header>

              <dl className="mvp-page__dados">
                <div><dt>Objetivo</dt><dd>{mvp.objetivo}</dd></div>
                <div><dt>Critério de sucesso</dt><dd>{mvp.criterioSucesso}</dd></div>
                <div><dt>Métrica</dt><dd>{mvp.metrica}</dd></div>
                <div><dt>Prazo</dt><dd>{mvp.prazo || '—'}</dd></div>
              </dl>

              <footer className="mvp-page__card-footer">
                <p>
                  {quantidade === undefined
                    ? 'Evidências indisponíveis'
                    : `${quantidade} ${quantidade === 1 ? 'evidência anexada' : 'evidências anexadas'}`}
                </p>
                <div className="mvp-page__acoes">
                  <button type="button" className="mvp-page__btn" disabled={bloqueado} onClick={() => abrirEvidencias(mvp)}>Ver evidências</button>
                  <button type="button" className="mvp-page__btn mvp-page__btn--primario" disabled={bloqueado} onClick={() => abrirFormulario(mvp)}>Editar</button>
                </div>
              </footer>
            </article>
          );
        })}

        {!carregando && !erro && !mvps?.length && (
          <section className="mvp-page__card mvp-page__vazio">
            <h2>{mvps ? 'Nenhum MVP cadastrado' : 'MVPs indisponíveis'}</h2>
            <p>{mvps ? 'Use Novo MVP para registrar uma hipótese de validação.' : 'Os registros serão exibidos quando os dados estiverem disponíveis.'}</p>
          </section>
        )}
      </section>

      <dialog
        ref={dialogRef}
        className="mvp-page__modal"
        aria-labelledby="mvp-modal-titulo"
        onCancel={(event) => {
          event.preventDefault();
          fecharModal();
        }}
      >
        {modal && (
          <div className="mvp-page__modal-conteudo">
            <header className="mvp-page__modal-header">
              <h2 id="mvp-modal-titulo">
                {modal.tipo === 'evidencias' ? 'Evidências do MVP' : modal.id ? 'Editar MVP' : 'Novo MVP'}
              </h2>
              <button type="button" className="mvp-page__fechar" aria-label="Fechar" onClick={fecharModal} disabled={salvando}>×</button>
            </header>

            {modal.tipo === 'formulario' ? (
              <form onSubmit={salvar}>
                {!onSalvarMvp && <p className="mvp-page__estado" role="status">O serviço de cadastro de MVPs ainda não está conectado.</p>}
                {erroAcao && <p className="mvp-page__estado mvp-page__erro" role="alert">{erroAcao}</p>}
                <fieldset className="mvp-page__form" disabled={bloqueado}>
                  <label>
                    Projeto vinculado *
                    <input required value={modal.dados.projeto} onChange={(event) => alterarCampo('projeto', event.target.value)} placeholder="Código ou identificação do projeto" />
                  </label>
                  <label className="mvp-page__campo-largo">
                    Hipótese *
                    <textarea required rows={2} value={modal.dados.hipotese} onChange={(event) => alterarCampo('hipotese', event.target.value)} placeholder="Descreva a hipótese que será validada" />
                  </label>
                  <label className="mvp-page__campo-largo">
                    Objetivo *
                    <textarea required rows={2} value={modal.dados.objetivo} onChange={(event) => alterarCampo('objetivo', event.target.value)} />
                  </label>
                  <label className="mvp-page__campo-largo">
                    Critério de sucesso *
                    <textarea required rows={2} value={modal.dados.criterioSucesso} onChange={(event) => alterarCampo('criterioSucesso', event.target.value)} />
                  </label>
                  <label>
                    Métrica *
                    <input required value={modal.dados.metrica} onChange={(event) => alterarCampo('metrica', event.target.value)} />
                  </label>
                  <label>
                    Prazo *
                    <input type="date" required value={modal.dados.prazo} onChange={(event) => alterarCampo('prazo', event.target.value)} />
                  </label>
                  <label>
                    Status *
                    <select required value={modal.dados.status} onChange={(event) => alterarCampo('status', event.target.value)}>
                      {[...new Set([...opcoesStatus, modal.dados.status])].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </fieldset>

                <div className="mvp-page__modal-acoes">
                  <button type="button" className="mvp-page__btn" onClick={fecharModal} disabled={salvando}>Cancelar</button>
                  <button type="submit" className="mvp-page__btn mvp-page__btn--primario" disabled={!onSalvarMvp || bloqueado}>{salvando ? 'Salvando...' : 'Salvar MVP'}</button>
                </div>
              </form>
            ) : (
              <>
                <p className="mvp-page__codigo">{modal.mvp.codigo} · {modal.mvp.projeto}</p>
                <h3 className="mvp-page__hipotese">{modal.mvp.hipotese}</h3>
                {modal.mvp.evidencias?.length ? (
                  <ul className="mvp-page__evidencias">
                    {modal.mvp.evidencias.map((evidencia) => (
                      <li key={evidencia.id}>
                        <strong>{evidencia.titulo}</strong>
                        {evidencia.descricao && <p>{evidencia.descricao}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mvp-page__estado">{modal.mvp.evidencias ? 'Nenhuma evidência anexada.' : 'Detalhes das evidências indisponíveis.'}</p>
                )}
                <div className="mvp-page__modal-acoes">
                  <button type="button" className="mvp-page__btn" onClick={fecharModal}>Fechar</button>
                </div>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
