import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ProjetoDetalhadoApi } from '../services/projetoService';
import { formatarData } from '../utils/matchFormatters';
import './ProjetosKanban.css';

const colunas = [
  { id: 'aprovado', titulo: 'Aprovado' },
  { id: 'planejamento', titulo: 'Planejamento' },
  { id: 'desenvolvimento', titulo: 'Em Desenvolvimento' },
  { id: 'teste', titulo: 'Em Teste' },
  { id: 'concluido', titulo: 'Concluído' },
] as const;

export type StatusProjetoKanban = (typeof colunas)[number]['id'];

export interface ProjetoKanban {
  id: string;
  codigo: string;
  titulo: string;
  responsavel?: string;
  status: StatusProjetoKanban;
}

export interface NovoProjetoKanban {
  titulo: string;
  matchId: string;
  prazo: string;
}

export interface ProjetosKanbanProps {
  projetos?: readonly ProjetoKanban[];
  carregando?: boolean;
  erro?: string;
  origens?: readonly { id: number; titulo: string }[];
  avisoOrigens?: string;
  onCriarProjeto?: (projeto: NovoProjetoKanban) => Promise<void> | void;
  onMoverProjeto?: (id: string, status: StatusProjetoKanban) => Promise<void> | void;
  onConsultarProjeto: (id: string) => Promise<ProjetoDetalhadoApi>;
  onAtualizarProjeto: (id: string, dados: { titulo: string; descricao: string | null; data_prazo: string | null }) => Promise<ProjetoDetalhadoApi>;
}

export function ProjetosKanban({
  projetos,
  carregando = false,
  erro = '',
  origens = [],
  avisoOrigens,
  onCriarProjeto,
  onMoverProjeto,
  onConsultarProjeto,
  onAtualizarProjeto,
}: ProjetosKanbanProps) {
  const [formulario, setFormulario] = useState<NovoProjetoKanban | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [editando, setEditando] = useState<ProjetoDetalhadoApi | null>(null);
  const bloqueado = carregando || Boolean(erro) || processando;
  const modalRef = useRef<HTMLDialogElement>(null);
  const formularioAberto = formulario !== null || editando !== null;

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal || !formularioAberto) return;

    modal.showModal();
    modal.querySelector('input')?.focus();

    return () => {
      modal.close();
    };
  }, [formularioAberto]);

  function abrirFormulario() {
    setFormulario({ titulo: '', matchId: '', prazo: '' });
    setMensagem('');
    setErroAcao('');
  }

  function fecharFormulario() {
    if (processando) return;
    setFormulario(null);
    setEditando(null);
    setErroAcao('');
  }

  async function consultar(projeto: ProjetoKanban) {
    if (bloqueado) return;
    setProcessando(true);
    setErroAcao('');
    setMensagem('');
    try {
      setEditando(await onConsultarProjeto(projeto.id));
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível consultar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  async function atualizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editando || bloqueado) return;
    const titulo = editando.titulo.trim();
    if (titulo.length < 3) {
      setErroAcao('Informe um título com pelo menos 3 caracteres.');
      return;
    }
    setProcessando(true);
    setErroAcao('');
    try {
      setEditando(await onAtualizarProjeto(String(editando.id_projeto), {
        titulo,
        descricao: editando.descricao?.trim() || null,
        data_prazo: editando.data_prazo || null,
      }));
      setMensagem('Projeto atualizado.');
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível atualizar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  async function criarProjeto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formulario || !onCriarProjeto || bloqueado) return;

    const titulo = formulario.titulo.trim();

    if (!formulario.matchId || (titulo && titulo.length < 3)) {
      setErroAcao('Selecione o vínculo e, se informar um título, use pelo menos 3 caracteres.');
      return;
    }

    setProcessando(true);
    setErroAcao('');
    setMensagem('');

    try {
      await onCriarProjeto({
        ...formulario,
        titulo,
      });
      setFormulario(null);
      setMensagem('Projeto cadastrado com sucesso.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível cadastrar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  async function moverProjeto(projeto: ProjetoKanban, status: StatusProjetoKanban) {
    if (!onMoverProjeto || bloqueado || projeto.status === status) return;

    setProcessando(true);
    setErroAcao('');
    setMensagem('');

    try {
      await onMoverProjeto(projeto.id, status);
      setMensagem('Status do projeto atualizado.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível atualizar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="kanban-page" aria-busy={carregando || processando}>
      <header className="kanban-page__header">
        <div>
          <h1>Projetos / Kanban</h1>
          <p>Acompanhamento do portfólio de projetos de inovação.</p>
        </div>

        <button
          type="button"
          className="kanban-page__btn kanban-page__btn--primario"
          onClick={() => abrirFormulario()}
          disabled={bloqueado || !origens.length}
        >
          <span aria-hidden="true">+</span> Novo Projeto
        </button>
      </header>

      {carregando && <p className="kanban-page__estado" role="status">Carregando projetos...</p>}
      {erro && <p className="kanban-page__estado kanban-page__erro" role="alert">{erro}</p>}
      {!carregando && !erro && !origens.length && (
        <p className="kanban-page__estado">{avisoOrigens || 'Para criar um projeto, é preciso ter um match validado, uma triagem aprovada e uma ideia aprovada.'}</p>
      )}
      {!carregando && !erro && projetos === undefined && (
        <p className="kanban-page__estado">Dados dos projetos indisponíveis.</p>
      )}
      {mensagem && <p className="kanban-page__estado kanban-page__sucesso" role="status">{mensagem}</p>}
      {!formulario && erroAcao && <p className="kanban-page__estado kanban-page__erro" role="alert">{erroAcao}</p>}

      <dialog
        ref={modalRef}
        className="kanban-page__modal"
        aria-labelledby="kanban-form-title"
        aria-describedby={formulario ? 'kanban-form-description' : undefined}
        onCancel={(event) => {
          event.preventDefault();
          fecharFormulario();
        }}
      >
        {editando && (
          <section className="kanban-page__form-card">
            <h2 id="kanban-form-title">Detalhes do projeto</h2>
            {erroAcao && <p className="kanban-page__erro" role="alert">{erroAcao}</p>}
            {mensagem && <p className="kanban-page__sucesso" role="status">{mensagem}</p>}
            <form onSubmit={atualizar}>
              <fieldset className="kanban-page__form-fields" disabled={processando}>
                <label>
                  Título
                  <input required minLength={3} maxLength={150} value={editando.titulo}
                    onChange={(event) => setEditando({ ...editando, titulo: event.target.value })} />
                </label>
                <label>
                  Descrição
                  <textarea maxLength={5000} value={editando.descricao ?? ''}
                    onChange={(event) => setEditando({ ...editando, descricao: event.target.value })} />
                </label>
                <label>
                  Prazo
                  <input type="date" value={editando.data_prazo ?? ''}
                    onChange={(event) => setEditando({ ...editando, data_prazo: event.target.value })} />
                </label>
              </fieldset>
              <h3>Histórico de movimentações</h3>
              {editando.historico.length ? (
                <ul>
                  {editando.historico.map((item) => (
                    <li key={item.id_movimentacao}>{item.etapa_origem} → {item.etapa_destino} · {formatarData(item.data_movimentacao)}</li>
                  ))}
                </ul>
              ) : <p>Nenhuma movimentação registrada.</p>}
              <div className="kanban-page__form-actions">
                <button type="button" className="kanban-page__btn" disabled={processando} onClick={fecharFormulario}>Fechar</button>
                <button type="submit" className="kanban-page__btn kanban-page__btn--primario" disabled={processando}>
                  {processando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        )}
        {formulario && (
          <section className="kanban-page__form-card">
            <header className="kanban-page__modal-header">
              <div>
                <h2 id="kanban-form-title">Novo Projeto</h2>
                <p id="kanban-form-description">Preencha as informações para adicionar um projeto ao Kanban.</p>
              </div>
              <button
                type="button"
                className="kanban-page__modal-close"
                aria-label="Fechar formulário"
                onClick={fecharFormulario}
                disabled={processando}
              >
                ×
              </button>
            </header>
            {!onCriarProjeto && (
              <p className="kanban-page__estado" role="status">
                O serviço de cadastro de projetos ainda não está conectado.
              </p>
            )}
            {erroAcao && (
              <p className="kanban-page__estado kanban-page__erro" role="alert">{erroAcao}</p>
            )}
            <form onSubmit={criarProjeto}>
              <div className="kanban-page__form-fields">
                <label className="kanban-page__campo-titulo">
                  Título do projeto
                  <input
                    maxLength={150}
                    autoFocus
                    value={formulario.titulo}
                    onChange={(event) => setFormulario({ ...formulario, titulo: event.target.value })}
                    disabled={bloqueado}
                    placeholder="Informe o título"
                  />
                </label>
                <label>
                  Ideia e desafio *
                  <select required value={formulario.matchId} disabled={bloqueado}
                    onChange={(event) => setFormulario({ ...formulario, matchId: event.target.value })}>
                    <option value="">Selecione um vínculo</option>
                    {origens.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
                  </select>
                </label>
                <label>
                  Prazo
                  <input
                    type="date"
                    value={formulario.prazo}
                    onChange={(event) => setFormulario({ ...formulario, prazo: event.target.value })}
                    disabled={bloqueado}
                  />
                </label>
              </div>
              <div className="kanban-page__form-actions">
                <button type="button" className="kanban-page__btn" onClick={fecharFormulario} disabled={processando}>Cancelar</button>
                <button type="submit" className="kanban-page__btn kanban-page__btn--primario" disabled={bloqueado || !onCriarProjeto}>
                  {processando ? 'Salvando...' : 'Cadastrar projeto'}
                </button>
              </div>
            </form>
          </section>
        )}
      </dialog>

      <div className="kanban-page__board" aria-label="Quadro de projetos por etapa">
        {colunas.map((coluna) => {
          const lista = projetos?.filter((projeto) => projeto.status === coluna.id) ?? [];

          return (
            <section
              key={coluna.id}
              className={`kanban-page__coluna kanban-page__coluna--${coluna.id}`}
              aria-labelledby={`kanban-coluna-${coluna.id}`}
            >
              <div className="kanban-page__coluna-header">
                <h2 id={`kanban-coluna-${coluna.id}`}>{coluna.titulo}</h2>
                <span className="kanban-page__contagem" aria-label={projetos ? `${lista.length} projetos` : 'Quantidade indisponível'}>
                  {projetos ? lista.length : '—'}
                </span>
              </div>

              <ul className="kanban-page__lista">
                {lista.map((projeto) => (
                  <li key={projeto.id} className="kanban-page__projeto">
                    <span className="kanban-page__codigo">{projeto.codigo}</span>
                    <h3>{projeto.titulo}</h3>
                    {projeto.responsavel && <p>{projeto.responsavel}</p>}
                    <button type="button" className="kanban-page__btn" disabled={bloqueado} onClick={() => void consultar(projeto)}>
                      Ver detalhes
                    </button>
                    {onMoverProjeto && projeto.status !== 'concluido' && (
                      <label className="kanban-page__mover">
                        <span>Mover para</span>
                        <select
                          aria-label={`Alterar etapa de ${projeto.titulo}`}
                          value={projeto.status}
                          disabled={bloqueado}
                          onChange={(event) => moverProjeto(projeto, event.target.value as StatusProjetoKanban)}
                        >
                          {colunas.map((destino) => <option key={destino.id} value={destino.id}>{destino.titulo}</option>)}
                        </select>
                      </label>
                    )}
                  </li>
                ))}
                {!lista.length && <li className="kanban-page__vazio">{carregando ? 'Carregando...' : projetos ? 'Nenhum projeto' : 'Sem dados'}</li>}
              </ul>

              {coluna.id === 'aprovado' && <button
                type="button"
                className="kanban-page__adicionar"
                aria-label={`Adicionar projeto em ${coluna.titulo}`}
                onClick={abrirFormulario}
                disabled={bloqueado || !origens.length}
              >
                <span aria-hidden="true">+</span> Adicionar
              </button>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
